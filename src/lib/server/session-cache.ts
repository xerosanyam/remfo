import type { Session, User } from 'lucia';

// hooks.server.ts reads/writes this to skip a Turso round trip on repeat requests for the same
// session. It lives here rather than inside hooks.server.ts so logout can evict an entry without
// importing from a SvelteKit special file. Per-instance and unbounded by design; entries are
// dropped on logout and when read past their own expiry.
export const sessionAndUserInfo: {
	[key: string]: { session: Session | null; user: User | null };
} = {};

export function evictSessionCache(sessionId: string) {
	delete sessionAndUserInfo[sessionId];
}
