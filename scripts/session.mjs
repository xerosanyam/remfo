// Shared test-session helper. Protected pages need a real session cookie, so both the
// perf harness and the no-JS guard mint a user_session row the same way the lucia libsql
// adapter does, then delete it again. Kept in one place so a change to lucia's session
// schema breaks one file rather than two.

import { existsSync, readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createClient } from '@libsql/client';

// vite loads .env then .env.local, later wins
export function loadEnv() {
	const env = {};
	for (const file of ['.env', '.env.local']) {
		if (!existsSync(file)) continue;
		for (const line of readFileSync(file, 'utf8').split('\n')) {
			const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
			if (m) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, '');
		}
	}
	return env;
}

export function openDb(env) {
	if (!env.TURSO_CONNECTION_URL) throw new Error('TURSO_CONNECTION_URL missing from .env');
	return createClient({ url: env.TURSO_CONNECTION_URL, authToken: env.TURSO_AUTH_TOKEN });
}

// PERF_USER_ID pins which account the scripts drive; otherwise the oldest user wins.
export async function mintSession(app, env) {
	const userId =
		env.PERF_USER_ID ??
		(await app.execute('SELECT id FROM auth_user ORDER BY created_at LIMIT 1')).rows[0]?.id;
	if (!userId) throw new Error('no user in auth_user to mint a session for');

	// Same columns and second-precision expiry the lucia libsql adapter writes.
	//
	// The 30 days matters and is not arbitrary. lucia marks a session `fresh` once it is
	// past the halfway point of sessionExpiresIn (30 days by default here, since
	// auth.ts sets no override) and then issues an UPDATE to extend it. A short-lived
	// session is past halfway the moment it is created, so every single request would pay
	// an extra write round trip that a real user pays roughly once a fortnight. That
	// silently inflated every authenticated measurement taken with this harness.
	const sessionId = randomUUID();
	const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;
	await app.execute({
		sql: 'INSERT INTO user_session (id, user_id, expires_at) VALUES (?, ?, ?)',
		args: [sessionId, userId, Math.floor(Date.now() / 1000) + THIRTY_DAYS_IN_SECONDS]
	});
	return { sessionId, userId };
}

export async function deleteSession(app, sessionId) {
	await app.execute({ sql: 'DELETE FROM user_session WHERE id = ?', args: [sessionId] });
}
