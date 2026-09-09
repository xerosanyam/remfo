// @vitest-environment node
// Not happy-dom: this drives a real in-memory libsql database. The /sqlite3 entry point avoids
// the `ws` import in the default build, which will not load under the test runner.
import { describe, expect, it, vi } from 'vitest';

// reviewCard reads the card by (id, user_id) and used to hand cards[0] straight to the SM-2
// calculation. A forged or foreign cardId matches nothing, so that was undefined.repetitions --
// a 500 on attacker-controlled input rather than a 4xx (remfo-e67).
vi.mock('$lib/db/turso.db', async () => {
	const { createClient } = await import('@libsql/client/sqlite3');
	// matching /sqlite3 entry: drizzle-orm/libsql pulls the default @libsql/client, and `ws`
	// with it
	const { drizzle } = await import('drizzle-orm/libsql/sqlite3');
	const { readFileSync, readdirSync } = await import('node:fs');

	const client = createClient({ url: ':memory:' });
	const dir = new URL('../../../../migrations', import.meta.url).pathname;
	for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
		for (const statement of readFileSync(`${dir}/${file}`, 'utf8').split(
			'--> statement-breakpoint'
		)) {
			if (statement.trim()) await client.execute(statement.trim());
		}
	}
	await client.execute({
		sql: 'INSERT INTO auth_user (id, email, given_name) VALUES (?, ?, ?)',
		args: ['owner', 'a@b.c', 'Owner']
	});
	await client.execute({
		sql: 'INSERT INTO card (id, front, back, user_id) VALUES (?, ?, ?, ?)',
		args: ['owned-card', 'q', 'a', 'owner']
	});

	return { db: drizzle(client), turso_client: client };
});

const { reviewCard } = await import('./card.table');

describe('reviewCard', () => {
	it('reviews a card the user owns', async () => {
		await expect(
			reviewCard({ cardId: 'owned-card', userId: 'owner', difficulty: 'Easy' })
		).resolves.toBe(true);
	});

	it('reports not-found for a cardId belonging to someone else, rather than throwing', async () => {
		await expect(
			reviewCard({ cardId: 'owned-card', userId: 'someone-else', difficulty: 'Easy' })
		).resolves.toBe(false);
	});

	it('reports not-found for a cardId that does not exist at all', async () => {
		await expect(
			reviewCard({ cardId: 'no-such-card', userId: 'owner', difficulty: 'Easy' })
		).resolves.toBe(false);
	});
});
