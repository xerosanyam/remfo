// @vitest-environment node
// Not happy-dom, and the /sqlite3 entry point specifically: this drives a real in-memory
// database and needs no network transport. The default and /node entry points both pull in
// `ws`, which fails to import as ESM under the test runner.
import { createClient, type Client } from '@libsql/client/sqlite3';
import { readFileSync, readdirSync } from 'node:fs';
import { beforeEach, describe, expect, it } from 'vitest';

// The activity table is written by SQL triggers, not app code, and /measure reads action='UPDATE'
// as "reviewed". deleteCard is a soft delete (UPDATE card SET deleted = 1), so it used to log an
// 'UPDATE' and every delete inflated the streak and painted the heatmap (remfo-8l0). Nothing else
// exercises the triggers, so this applies the real migrations to an in-memory database and drives
// them directly.
const MIGRATIONS_DIR = new URL('../../../migrations', import.meta.url).pathname;

async function migratedDb(): Promise<Client> {
	const db = createClient({ url: ':memory:' });
	const files = readdirSync(MIGRATIONS_DIR)
		.filter((file) => file.endsWith('.sql'))
		.sort();
	for (const file of files) {
		const sql = readFileSync(`${MIGRATIONS_DIR}/${file}`, 'utf8');
		for (const statement of sql.split('--> statement-breakpoint')) {
			if (statement.trim()) await db.execute(statement.trim());
		}
	}
	await db.execute({
		sql: 'INSERT INTO auth_user (id, email, given_name) VALUES (?, ?, ?)',
		args: ['u1', 'a@b.c', 'Test']
	});
	await db.execute({
		sql: 'INSERT INTO card (id, front, back, user_id) VALUES (?, ?, ?, ?)',
		args: ['c1', 'q', 'a', 'u1']
	});
	return db;
}

async function actions(db: Client) {
	const { rows } = await db.execute("SELECT action FROM activity WHERE card_id = 'c1'");
	return rows.map((row) => row.action);
}

let db: Client;
beforeEach(async () => {
	db = await migratedDb();
});

describe('activity triggers', () => {
	it('logs an INSERT when a card is created', async () => {
		expect(await actions(db)).toEqual(['INSERT']);
	});

	it('logs an UPDATE for a real review', async () => {
		await db.execute("UPDATE card SET repetitions = 1, interval = 6 WHERE id = 'c1'");

		expect(await actions(db)).toEqual(['INSERT', 'UPDATE']);
	});

	// The regression: this used to log 'UPDATE', which /measure counts as a review.
	it('logs a soft delete as DELETE, never as UPDATE', async () => {
		await db.execute("UPDATE card SET deleted = 1 WHERE id = 'c1'");

		expect(await actions(db)).toEqual(['INSERT', 'DELETE']);
		const { rows } = await db.execute(
			"SELECT count(*) as count FROM activity WHERE card_id = 'c1' AND action = 'UPDATE'"
		);
		expect(rows[0].count).toBe(0);
	});
});
