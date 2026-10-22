import { describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';

vi.mock('#lib/server/auth.js', () => ({
	google: {
		createAuthorizationURL: vi.fn(
			async () => new URL('https://accounts.google.com/o/oauth2/v2/auth')
		)
	}
}));

import { GET } from './+server';

describe('Google login redirect', () => {
	it('explicitly allows the Google origin and sets the OAuth flow cookies', async () => {
		const set = vi.fn();

		await expect(GET({ cookies: { set } } as unknown as RequestEvent)).rejects.toMatchObject({
			status: 302,
			location: 'https://accounts.google.com/o/oauth2/v2/auth'
		});
		expect(set).toHaveBeenCalledWith(
			'google_oauth_state',
			expect.any(String),
			expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
		);
		expect(set).toHaveBeenCalledWith(
			'google_oauth_code_verifier',
			expect.any(String),
			expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
		);
	});
});
