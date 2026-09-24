import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getTableConfig } from 'drizzle-orm/sqlite-core/utils';
import { activityTable, cardTable } from './turso.schema';

// remfo-5bhp: every per-request page query must hit an index. These assert the declarations;
// the migration-SQL assertion below guards against schema/migration drift in either direction.
describe('per-user query indexes', () => {
	it('indexes card lookups by user, deletion flag and both sort orders', () => {
		const names = getTableConfig(cardTable).indexes.map((index) => index.config.name);

		expect(names).toContain('card_user_deleted_created_idx');
		expect(names).toContain('card_user_deleted_next_idx');
	});

	it('indexes the activity aggregation by user and action', () => {
		const names = getTableConfig(activityTable).indexes.map((index) => index.config.name);

		expect(names).toContain('activity_user_action_idx');
	});

	it('ships a migration that creates exactly those indexes', () => {
		const sql = readFileSync(
			join(process.cwd(), 'migrations/0005_groovy_true_believers.sql'),
			'utf8'
		);

		for (const name of [
			'card_user_deleted_created_idx',
			'card_user_deleted_next_idx',
			'activity_user_action_idx'
		]) {
			expect(sql).toContain(`CREATE INDEX \`${name}\``);
		}
	});
});
