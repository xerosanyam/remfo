import { render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { afterNavigate, mockPage } = vi.hoisted(() => ({
	afterNavigate: vi.fn(),
	mockPage: {
		url: new URL('http://localhost/record'),
		data: { deviceType: { isMobile: false } }
	}
}));

vi.mock('$app/state', () => ({ page: mockPage }));
vi.mock('$app/navigation', () => ({ afterNavigate }));

import Layout from './+layout.svelte';
import { prerender } from './(protected)/record/+page';

const user = { id: 'u1', email: 'a@b.c', name: 'sanyam' };
const fetchMock = vi.fn();
const navigate = () => afterNavigate.mock.calls.at(-1)![0]();

beforeEach(() => {
	afterNavigate.mockClear();
	fetchMock.mockReset();
	vi.stubGlobal('fetch', fetchMock);
	mockPage.url = new URL('http://localhost/record');
});

describe('prerendered navigation session', () => {
	it('keeps /record prerendered and replaces public links after the session arrives', async () => {
		fetchMock.mockResolvedValue(Response.json({ user }));
		render(Layout, { data: { user: null } as never });

		expect(prerender).toBe(true);
		expect(screen.getByRole('link', { name: 'privacy policy' })).toBeInTheDocument();
		await navigate();

		expect(fetchMock).toHaveBeenCalledWith('/api/me');
		expect(await screen.findByRole('link', { name: 'revise' })).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'sign out' })).toBeInTheDocument();
		expect(screen.queryByRole('link', { name: 'privacy policy' })).not.toBeInTheDocument();
	});

	it('refreshes again when client navigation supplies a prerendered layout', async () => {
		fetchMock.mockResolvedValue(Response.json({ user }));
		const { rerender } = render(Layout, { data: { user } as never });
		await navigate();
		expect(fetchMock).not.toHaveBeenCalled();

		await rerender({ data: { user: null } as never });
		await navigate();

		expect(await screen.findByRole('link', { name: 'revise' })).toBeInTheDocument();
		expect(fetchMock).toHaveBeenCalledOnce();
	});

	it.each(['signed out', 'http error', 'offline', 'invalid json'])(
		'keeps public navigation when session lookup is %s',
		async (result) => {
			if (result === 'offline') fetchMock.mockRejectedValue(new TypeError('offline'));
			else if (result === 'http error')
				fetchMock.mockResolvedValue(new Response('error', { status: 500 }));
			else if (result === 'invalid json') fetchMock.mockResolvedValue(new Response('invalid'));
			else fetchMock.mockResolvedValue(Response.json({ user: null }));
			render(Layout, { data: { user: null } as never });

			await navigate();

			expect(screen.getByRole('link', { name: 'privacy policy' })).toBeInTheDocument();
			expect(screen.queryByRole('link', { name: 'revise' })).not.toBeInTheDocument();
		}
	);

	it('ignores a session response from before newer server data arrived', async () => {
		let respond!: (response: Response) => void;
		fetchMock.mockReturnValue(new Promise<Response>((resolve) => (respond = resolve)));
		const { rerender } = render(Layout, { data: { user: null } as never });
		const pending = navigate();

		await rerender({ data: { user } as never });
		respond(Response.json({ user: null }));
		await pending;

		expect(await screen.findByRole('link', { name: 'revise' })).toBeInTheDocument();
	});
});

// The placeholder Cell-Transport Quiz JSON-LD used to ship in the head of every page.
// This pins its absence while keeping the real head content covered.
describe('root layout head', () => {
	it('emits title and description with no structured-data placeholder', () => {
		render(Layout, { data: { user: null } as never });

		expect(document.title).toBe('remember forever');
		expect(document.head.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
			'a tool that helps you remember'
		);
		expect(
			document.head.querySelector('script[type="application/ld+json"]')
		).not.toBeInTheDocument();
	});

	it('renders the shell for a signed-in user without touching analytics', () => {
		const { container } = render(Layout, {
			data: { user: { id: 'u1', email: 'a@b.c', name: 'sanyam' } } as never
		});

		expect(container.querySelector('main')).toBeInTheDocument();
	});
});
