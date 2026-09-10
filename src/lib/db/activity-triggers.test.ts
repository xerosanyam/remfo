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

function migrationFiles() {
	return readdirSync(MIGRATIONS_DIR)
		.filter((file) => file.endsWith('.sql'))
		.sort();
}

async function apply(db: Client, files: string[]) {
	for (const file of files) {
		const sql = readFileSync(`${MIGRATIONS_DIR}/${file}`, 'utf8');
		for (const statement of sql.split('--> statement-breakpoint')) {
			if (statement.trim()) await db.execute(statement.trim());
		}
	}
}

async function migratedDb(): Promise<Client> {
	const db = createClient({ url: ':memory:' });
	await apply(db, migrationFiles());
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

async function pomodoro(db: Client, over: Record<string, unknown> = {}) {
	const row = {
		id: `p${Math.random().toString(16).slice(2)}`,
		user_id: 'u1',
		task: 'write the migration',
		duration: 1500,
		started_at: 1_700_000_000,
		ended_at: 1_700_001_500,
		completed: 1,
		...over
	};
	await db.execute({
		sql: `INSERT INTO pomodoro_session
		      (id, user_id, task, duration, started_at, ended_at, completed)
		      VALUES (?, ?, ?, ?, ?, ?, ?)`,
		args: [
			row.id,
			row.user_id,
			row.task,
			row.duration,
			row.started_at,
			row.ended_at,
			row.completed
		] as never[]
	});
	return row;
}

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

describe('pomodoro triggers', () => {
	it('logs a completed session as POMODORO with no card', async () => {
		await pomodoro(db);

		const { rows } = await db.execute("SELECT action, card_id FROM activity WHERE user_id = 'u1'");
		expect(rows.map((row) => row.action)).toEqual(['INSERT', 'POMODORO']);
		expect(rows.find((row) => row.action === 'POMODORO')?.card_id).toBe(null);
	});

	// Abandoning at minute 12 still keeps the real minutes on the session row, but must not paint
	// the heatmap, which counts completed sessions only.
	it('logs nothing for an abandoned session', async () => {
		await pomodoro(db, { completed: 0, ended_at: 1_700_000_720 });

		const { rows } = await db.execute(
			"SELECT count(*) as count FROM activity WHERE action = 'POMODORO'"
		);
		expect(rows[0].count).toBe(0);

		const session = await db.execute('SELECT started_at, ended_at FROM pomodoro_session');
		expect(Number(session.rows[0].ended_at) - Number(session.rows[0].started_at)).toBe(720);
	});

	// A session run logged out and claimed weeks later must land on the day it was worked, not the
	// day it was claimed, so the trigger copies ended_at rather than reading the clock.
	it('dates the activity row from ended_at, not from now', async () => {
		const row = await pomodoro(db);

		const { rows } = await db.execute("SELECT created_at FROM activity WHERE action = 'POMODORO'");
		expect(Number(rows[0].created_at)).toBe(row.ended_at);
	});
});

// 0004 rebuilds the activity table to make card_id nullable, which means dropping and recreating
// the table real production rows live in, on a database staging shares with production. The
// generated rebuild silently destroyed it (the rename reparses the card triggers, which reference
// a table that no longer exists at that point), so this applies everything up to 0003, puts rows
// in, and only then applies 0004.
describe('0004 activity rebuild', () => {
	const upTo0004 = () => migrationFiles().filter((file) => file < '0004');
	const only0004 = () => migrationFiles().filter((file) => file.startsWith('0004'));

	let old: Client;
	beforeEach(async () => {
		old = createClient({ url: ':memory:' });
		await apply(old, upTo0004());
		await old.execute({
			sql: 'INSERT INTO auth_user (id, email) VALUES (?, ?)',
			args: ['u1', 'a@b.c']
		});
		await old.execute({
			sql: 'INSERT INTO card (id, front, back, user_id) VALUES (?, ?, ?, ?)',
			args: ['c1', 'q', 'a', 'u1']
		});
	});

	it('preserves existing activity rows', async () => {
		const before = await old.execute('SELECT id, action, card_id FROM activity');
		expect(before.rows.length).toBe(1);

		await apply(old, only0004());

		const after = await old.execute('SELECT id, action, card_id FROM activity');
		expect(after.rows).toEqual(before.rows);
	});

	it('leaves the card triggers working', async () => {
		await apply(old, only0004());

		await old.execute("UPDATE card SET repetitions = 1 WHERE id = 'c1'");
		await old.execute("UPDATE card SET deleted = 1 WHERE id = 'c1'");

		const { rows } = await old.execute("SELECT action FROM activity WHERE card_id = 'c1'");
		expect(rows.map((row) => row.action)).toEqual(['INSERT', 'UPDATE', 'DELETE']);
	});
});
