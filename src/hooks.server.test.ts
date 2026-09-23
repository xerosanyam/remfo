import { describe, expect, it, vi, beforeEach } from 'vitest';

// The regression this file exists for (remfo-9s7): hooks.server.ts caches {session, user} in a
// module-level object keyed by session id and returns it without revalidating. Logout used to
// invalidate the DB row and clear the cookie but never touch this cache, so a replayed cookie
// stayed authenticated against the same warm instance. These assert on observable behaviour --
// whether the DB is consulted -- rather than on the cache object's contents, so they still hold
// if the caching internals change.
vi.mock('sveltekit-device-detector', () => ({
	handleDeviceDetector: (_options: unknown, handle: unknown) => handle
}));

const validateSession = vi.fn();
vi.mock('$lib/server/auth', () => ({
	lucia: {
		sessionCookieName: 'auth_session',
		validateSession,
		createSessionCookie: vi.fn(() => ({ name: 'auth_session', value: 'new', attributes: {} })),
		createBlankSessionCookie: vi.fn(() => ({ name: 'auth_session', value: '', attributes: {} }))
	}
}));

vi.mock('$lib/db/turso.db', () => ({
	turso_client: { execute: vi.fn() }
}));

const { handle } = await import('./hooks.server');
const { evictSessionCache, sessionAndUserInfo } = await import('$lib/server/session-cache');

function cache(sessionId: string, expiresAt: Date) {
	sessionAndUserInfo[sessionId] = {
		session: { id: sessionId, userId: 'u1', expiresAt, fresh: false },
		user: { id: 'u1' } as never
	};
}

function makeEvent(sessionId: string | undefined, url = 'http://localhost/record') {
	return {
		request: new Request(url),
		cookies: {
			get: vi.fn((name: string) => (name === 'auth_session' ? sessionId : undefined)),
			getAll: vi.fn(() =>
				sessionId === undefined ? [] : [{ name: 'auth_session', value: sessionId }]
			),
			set: vi.fn()
		},
		url: new URL(url),
		locals: {} as App.Locals
	};
}

const resolve = vi.fn(async () => new Response(null, { headers: new Headers() }));

beforeEach(() => {
	validateSession.mockReset();
	resolve.mockClear();
	for (const key of Object.keys(sessionAndUserInfo)) delete sessionAndUserInfo[key];
});

describe('session cache', () => {
	it('serves a live cached session without touching the DB', async () => {
		cache('s1', new Date(Date.now() + 100_000));

		await handle({ event: makeEvent('s1'), resolve } as never);

		expect(validateSession).not.toHaveBeenCalled();
	});

	it('revalidates against the DB once the entry has been evicted, rather than serving it', async () => {
		cache('s1', new Date(Date.now() + 100_000));
		validateSession.mockResolvedValue({ session: null, user: null });

		evictSessionCache('s1');
		const event = makeEvent('s1');
		await handle({ event, resolve } as never);

		expect(validateSession).toHaveBeenCalledWith('s1');
		expect(event.locals.session).toBeNull();
	});

	it('treats an entry past its own expiry as a miss instead of serving it stale', async () => {
		cache('s1', new Date(Date.now() - 1000));
		validateSession.mockResolvedValue({ session: null, user: null });

		const event = makeEvent('s1');
		await handle({ event, resolve } as never);

		expect(validateSession).toHaveBeenCalledWith('s1');
		expect(event.locals.session).toBeNull();
	});
});

// remfo-o0bj: anonymous HTML is browser-cached (private, never edge-cached -- Vercel's CDN
// key ignores cookies, so an s-maxage'd anonymous page would also serve to logged-in users).
describe('anonymous browser caching', () => {
	it('marks cookieless GET 200s private with Vary: Cookie', async () => {
		const resolve200 = vi.fn(async () => new Response('x', { status: 200 }));

		await handle({ event: makeEvent(undefined), resolve: resolve200 } as never);

		const headers = (await resolve200.mock.results[0].value).headers;
		expect(headers.get('Cache-Control')).toBe('private, max-age=60');
		expect(headers.get('Vary')).toBe('Cookie');
	});

	it('sets no cache headers when the request carries cookies', async () => {
		cache('s1', new Date(Date.now() + 100_000));
		const resolve200 = vi.fn(async () => new Response('x', { status: 200 }));

		await handle({ event: makeEvent('s1'), resolve: resolve200 } as never);

		const headers = (await resolve200.mock.results[0].value).headers;
		expect(headers.get('Cache-Control')).toBeNull();
	});

	it('sets no cache headers on non-200 responses', async () => {
		const resolve302 = vi.fn(async () => new Response(null, { status: 302 }));

		await handle({ event: makeEvent(undefined), resolve: resolve302 } as never);

		expect((await resolve302.mock.results[0].value).headers.get('Cache-Control')).toBeNull();
	});

	it('sets no cache headers on the __dbping diagnostic so it always measures live', async () => {
		const resolve200 = vi.fn(async () => new Response('x', { status: 200 }));

		await handle({
			event: makeEvent(undefined, 'http://localhost/pricing?__dbping'),
			resolve: resolve200
		} as never);

		expect((await resolve200.mock.results[0].value).headers.get('Cache-Control')).toBeNull();
	});
});
