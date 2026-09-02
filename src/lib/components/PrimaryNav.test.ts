import { render, screen } from '@testing-library/svelte';
import { readable } from 'svelte/store';
import { describe, expect, it, vi } from 'vitest';

// Pin to mobile homepage: signed-out navigation must remain visible without JavaScript.
vi.mock('$app/stores', () => ({
	page: readable({ url: new URL('http://localhost/'), data: { deviceType: { isMobile: true } } })
}));

import PrimaryNav from './PrimaryNav.svelte';

const user = { id: 'u1', name: 'sanyam', email: 'a@b.c', picture: '' };

describe('PrimaryNav', () => {
	it('offers sign in when there is no user', () => {
		const { container } = render(PrimaryNav, { user: null });

		expect(container.querySelector('details')?.open).toBe(true);
		expect(screen.getByText('sign up / login')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'privacy policy' })).toHaveAttribute(
			'href',
			'/privacy'
		);
		expect(screen.queryByText('revise')).not.toBeInTheDocument();
	});

	// The regression this exists for: this component lives in the root layout, so it survives
	// client-side navigation. Signing in without a full page load changes `user` on an
	// existing instance, and a one-time assignment would leave the signed-out links up.
	it('swaps to the signed-in links when user arrives without a remount', async () => {
		const { container, rerender } = render(PrimaryNav, { user: null });
		expect(screen.getByText('sign up / login')).toBeInTheDocument();

		await rerender({ user });

		expect(screen.getByText('revise')).toBeInTheDocument();
		expect(container.querySelector('details')?.open).toBe(false);
		expect(screen.queryByRole('link', { name: 'privacy policy' })).not.toBeInTheDocument();
		expect(screen.queryByText('sign up / login')).not.toBeInTheDocument();
	});
});
