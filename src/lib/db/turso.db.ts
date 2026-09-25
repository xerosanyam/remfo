// The /web subpaths, not the bare ones. `@libsql/client`'s exports map resolves the
// `edge-light` condition to its pure-HTTP web build and the `node` condition to a build
// that pulls the native libsql binding plus `ws`. Bare imports therefore silently change
// client depending on the runtime, and on any node runtime they drag native deps this app
// never uses -- it only ever talks to a remote libsql:// URL over HTTP. Pinning /web keeps
// what edge already resolves to today, and keeps it if the runtime ever changes.
import { drizzle } from 'drizzle-orm/libsql/web';
import { createClient } from '@libsql/client/web';
import { TURSO_AUTH_TOKEN, TURSO_CONNECTION_URL } from '$env/static/private';
import { env } from '$env/dynamic/private';

export const turso_client = createClient({
	url: TURSO_CONNECTION_URL,
	authToken: TURSO_AUTH_TOKEN
});

// Dev-only: SLOW_DB_BY_MS delays every DB round trip (drizzle, lucia, ?__dbping all funnel
// through execute) so loading states stay visible. Unset / 0 = normal speed.
const rawExecute = turso_client.execute.bind(turso_client);
turso_client.execute = (async (...args: Parameters<typeof rawExecute>) => {
	const delay = Number(env.SLOW_DB_BY_MS ?? 0);
	if (delay > 0) await new Promise((r) => setTimeout(r, delay));
	return rawExecute(...args);
}) as typeof turso_client.execute;

export const db = drizzle(
	turso_client
	// { logger: true }
);
