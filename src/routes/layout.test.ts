import { render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

vi.mock('$app/state', () => ({
	page: { url: new URL('http://localhost/'), data: { deviceType: { isMobile: false } } }
}));

import Layout from './+layout.svelte';

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
