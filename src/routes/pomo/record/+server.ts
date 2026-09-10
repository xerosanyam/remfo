import { error, json } from '@sveltejs/kit';

import { sessionExists } from '$lib/common.util.js';
import { pomodoroRecordSchema } from '$lib/schemas.js';
import { insertPomodoroSession } from '$lib/db/tables/pomodoro.table.js';

// A sibling endpoint rather than a form action on /pomo, because nothing here is a form: the POST
// is fired by a countdown reaching zero, and there are no validation messages to render back into
// a page. JSON bodies also cannot be sent cross-origin without a preflight, so this keeps the CSRF
// protection that SvelteKit gives form posts.
export async function POST({ request, locals }) {
	// 401 rather than a redirect: a logged-out client is expected to keep the session in its own
	// storage and claim it after signing in, so it needs an answer it can act on.
	if (!sessionExists(locals)) error(401, 'not signed in');

	const parsed = pomodoroRecordSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) error(400, 'invalid session');

	const { duration, startedAt, endedAt, completed } = parsed.data;
	await insertPomodoroSession({
		id: crypto.randomUUID(),
		userId: locals.user.id,
		duration,
		startedAt: new Date(startedAt * 1000),
		endedAt: new Date(endedAt * 1000),
		completed
	});

	return json({ ok: true });
}
