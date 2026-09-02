import { fireEvent, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';

import DevicePage from './+page.svelte';
import type { PageData } from './$types';

// This page exists for browsers that cannot load Google's sign-in page, so the thing worth
// asserting is that it never depends on JavaScript: the code is in the markup, and the way
// forward is a plain form post rather than a click handler.
// PageData also carries user and deviceType from the root layout load. This page reads
// neither, so the fixture leaves them off and casts, matching record/page.test.ts.
const pageData = (fields: Record<string, unknown>) => fields as unknown as PageData;

const data = pageData({
	unavailable: false,
	userCode: 'ABCD-EFGH',
	verificationUrl: 'https://www.google.com/device',
	expiresAt: Date.now() + 30 * 60 * 1000,
	intervalSeconds: 5
});

describe('device login page', () => {
	it('shows the code and where to enter it', () => {
		render(DevicePage, { data, form: null });

		expect(screen.getByText('ABCD-EFGH')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'google.com/device' })).toBeInTheDocument();
	});

	// clicking through to google in the same tab takes the code off the user's screen
	it("opens google's page away from this one, so the code stays on screen", () => {
		render(DevicePage, { data, form: null });

		const link = screen.getByRole('link', { name: 'google.com/device' });
		expect(link).toHaveAttribute('target', '_blank');
		expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'));
	});

	it('lets one tap select the whole code', () => {
		render(DevicePage, { data, form: null });

		expect(screen.getByText('ABCD-EFGH')).toHaveClass('select-all');
	});

	it('copies when the code itself is clicked', async () => {
		const clipboard = { writeText: vi.fn().mockResolvedValue(undefined) };
		vi.stubGlobal('navigator', { ...navigator, clipboard });

		render(DevicePage, { data, form: null });
		await fireEvent.click(await screen.findByRole('button', { name: 'copy code ABCD-EFGH' }));

		expect(clipboard.writeText).toHaveBeenCalledWith('ABCD-EFGH');
		expect(screen.getByText('copied')).toBeInTheDocument();
		vi.unstubAllGlobals();
	});

	// a refusal is usually transient (an unfocused document, for one), so the control must
	// stay put and say so rather than vanishing
	it('keeps the code clickable, with an explanation, when the clipboard refuses', async () => {
		const clipboard = { writeText: vi.fn().mockRejectedValue(new Error('not focused')) };
		vi.stubGlobal('navigator', { ...navigator, clipboard });

		render(DevicePage, { data, form: null });
		await fireEvent.click(await screen.findByRole('button', { name: 'copy code ABCD-EFGH' }));

		expect(screen.getByText(/select it instead/)).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'copy code ABCD-EFGH' })).toBeInTheDocument();
		expect(screen.getByText('ABCD-EFGH')).toBeInTheDocument();
		vi.unstubAllGlobals();
	});

	it('continues with a plain form post, not a click handler', () => {
		render(DevicePage, { data, form: null });

		const form = document.querySelector('form');
		expect(form?.getAttribute('method')).toBe('post');
		expect(form?.querySelector('button[type="submit"]')).toBeInTheDocument();
	});

	// pressing continue early is the expected case, not an error, so it must keep the same
	// code on screen rather than sending the user back to a fresh one
	it('keeps the code visible when approval has not happened yet', () => {
		render(DevicePage, { data, form: { pending: true, slowDown: false } });

		expect(screen.getByRole('status')).toHaveTextContent('not approved yet');
		expect(screen.getByText('ABCD-EFGH')).toBeInTheDocument();
		expect(document.querySelector('form[method="post"]')).toBeInTheDocument();
	});

	it('explains an expired code and a declined request differently', () => {
		const { unmount } = render(DevicePage, { data, form: { expired: true } });
		expect(screen.getByRole('status')).toHaveTextContent('expired');
		unmount();

		render(DevicePage, { data, form: { denied: true } });
		expect(screen.getByRole('status')).toHaveTextContent('declined');
	});

	it('says so plainly when google could not be reached', () => {
		render(DevicePage, { data: pageData({ unavailable: true }), form: null });

		expect(screen.getByText(/could not reach google/)).toBeInTheDocument();
		expect(document.querySelector('form[method="post"]')).not.toBeInTheDocument();
	});

	// With JS we press the button for the user on google's interval, so a device that CAN run
	// scripts behaves like a normal polling device. The plain form post above stays the
	// fallback for the browsers this page exists for.
	describe('automatic polling when JavaScript runs', () => {
		afterEach(() => vi.useRealTimers());

		it("resubmits on google's interval without anyone clicking", async () => {
			vi.useFakeTimers();
			render(DevicePage, { data, form: null });
			const form = document.querySelector('form') as HTMLFormElement;
			const submit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {});

			await vi.advanceTimersByTimeAsync(5000);
			expect(submit).toHaveBeenCalledTimes(1);
		});

		it('stops once the code has expired, rather than polling forever', async () => {
			vi.useFakeTimers();
			render(DevicePage, {
				data: pageData({ ...data, expiresAt: Date.now() - 1000 }),
				form: null
			});
			const form = document.querySelector('form') as HTMLFormElement;
			const submit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => {});

			await vi.advanceTimersByTimeAsync(60000);
			expect(submit).not.toHaveBeenCalled();
		});
	});
});
