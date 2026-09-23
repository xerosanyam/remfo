import { render, screen, waitFor } from '@testing-library/svelte';
import { fireEvent } from '@testing-library/dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('$lib/posthog', () => ({
	capture: vi.fn(async () => undefined),
	identify: vi.fn(async () => undefined),
	reset: vi.fn(async () => undefined),
	captureException: vi.fn(async () => undefined)
}));

import Logout from './Logout.svelte';
import { capture, reset } from '$lib/posthog';

afterEach(() => {
	vi.clearAllMocks();
});

// Plain HTML submission is browser navigation, not fetch, so there is no request to
// intercept. What is provable: the click holds the submit until analytics finish (in
// order), and the submit still fires when the SDK never loads.
function submittedForm(container: HTMLElement) {
	const form = container.querySelector('form')!;
	const order: string[] = [];
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		order.push('submit');
	});
	return order;
}

describe('Logout analytics race', () => {
	it('holds the submit until capture and reset finish, in order', async () => {
		const { container } = render(Logout);
		const order = submittedForm(container);
		vi.mocked(capture).mockImplementation(async () => {
			order.push('capture');
		});
		vi.mocked(reset).mockImplementation(async () => {
			order.push('reset');
		});

		await fireEvent.click(screen.getByRole('button', { name: 'sign out' }));

		await waitFor(() => expect(order).toEqual(['capture', 'reset', 'submit']));
	});

	it('still submits when the analytics SDK never loads', async () => {
		vi.mocked(capture).mockImplementation(() => new Promise(() => {}));
		const { container } = render(Logout);
		const order = submittedForm(container);

		await fireEvent.click(screen.getByRole('button', { name: 'sign out' }));

		await waitFor(() => expect(order).toEqual(['submit']), { timeout: 5000 });
	}, 10000);
});
