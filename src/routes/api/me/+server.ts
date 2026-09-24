import { json } from '@sveltejs/kit';

// Session lookup for prerendered pages: hooks.server.ts already validated the session, so this
// adds no DB round trip. no-store: a cached {user:null} served post-login (or vice versa)
// would show the wrong nav / skip the / -> /record redirect.
export async function GET({ locals }) {
	return json(
		{ user: locals.user ?? null },
		{ headers: { 'Cache-Control': 'no-store' } }
	);
}
