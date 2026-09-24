import { render, screen } from '@testing-library/svelte';
import { fireEvent } from '@testing-library/dom';
import { readable } from 'svelte/store';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Pin to mobile homepage: signed-out navigation must remain visible without JavaScript.
vi.mock('$app/stores', () => ({
	page: readable({ url: new URL('http://localhost/'), data: { deviceType: { isMobile: true } } })
}));

import PrimaryNav from './PrimaryNav.svelte';

const user = { id: 'u1', name: 'sanyam', email: 'a@b.c', picture: '' };

beforeEach(() => {
	localStorage.clear();
	document.documentElement.classList.remove('dark');
});

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

	it('applies a saved choice and keeps the next choice across mounts', async () => {
		localStorage.setItem('theme', 'dark');
		const { unmount } = render(PrimaryNav, { user });
		const toggle = screen.getByRole('button', { name: 'dark mode' });

		expect(document.documentElement).toHaveClass('dark');
		expect(toggle).toHaveAttribute('aria-pressed', 'true');
		await fireEvent.click(toggle);
		expect(document.documentElement).not.toHaveClass('dark');
		expect(localStorage.getItem('theme')).toBe('light');

		unmount();
		render(PrimaryNav, { user });
		expect(screen.getByRole('button', { name: 'dark mode' })).toHaveAttribute(
			'aria-pressed',
			'false'
		);
	});

	it('follows the device setting when there is no saved choice', () => {
		const media = vi.spyOn(window, 'matchMedia').mockReturnValue({
			matches: true,
			addEventListener() {},
			removeEventListener() {}
		} as unknown as MediaQueryList);

		render(PrimaryNav, { user });
		expect(document.documentElement).toHaveClass('dark');
		expect(screen.getByRole('button', { name: 'dark mode' })).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		media.mockRestore();
	});
});
