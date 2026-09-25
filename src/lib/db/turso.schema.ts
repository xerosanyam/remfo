import { sql } from 'drizzle-orm';
import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const userTable = sqliteTable('auth_user', {
	id: text('id').primaryKey(),
	name: text('name'),
	given_name: text('given_name'),
	family_name: text('family_name'),
	picture: text('picture'),
	email: text('email').unique().notNull(),
	email_verified: integer('email_verified', { mode: 'boolean' }),
	locale: text('locale'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.$onUpdate(() => new Date())
		.notNull()
});
export type InsertUser = typeof userTable.$inferInsert;
export type SelectUser = typeof userTable.$inferSelect;

export const userSessionTable = sqliteTable('user_session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.$onUpdate(() => new Date())
		.notNull()
});
export type InsertSession = typeof userSessionTable.$inferInsert;
export type SelectSession = typeof userSessionTable.$inferSelect;

export const cardTable = sqliteTable(
	'card',
	{
		id: text('id').primaryKey(),
		front: text('front').notNull(),
		back: text('back').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => userTable.id),
		easiness: real('easiness').notNull().default(2.5),
		interval: integer('interval').notNull().default(1),
		repetitions: integer('repetitions').notNull().default(0),
		nextPractice: integer('next_practice', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.notNull(),
		deleted: integer('deleted', { mode: 'boolean' }).default(false).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.$onUpdate(() => new Date())
			.notNull()
	},
	// Every per-request card read filters on user_id + deleted and orders by one timestamp:
	// /record lists and counts by created_at, /revise lists due cards by next_practice.
	// Without these the queries full-scan, and the cost grows with each user's card count.
	(t) => [
		index('card_user_deleted_created_idx').on(t.userId, t.deleted, t.createdAt),
		index('card_user_deleted_next_idx').on(t.userId, t.deleted, t.nextPractice)
	]
);
export type InsertCard = typeof cardTable.$inferInsert;
export type SelectCard = typeof cardTable.$inferSelect;

export const activityTable = sqliteTable(
	'activity',
	{
		id: text('id').primaryKey(),
		action: text('action').notNull(),
		// Nullable: not every logged event has a card. A pomodoro session writes an activity row
		// with no card_id at all (see migrations/0004).
		cardId: text('card_id').references(() => cardTable.id),
		userId: text('user_id')
			.notNull()
			.references(() => userTable.id),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.notNull()
	},
	// /measure aggregates the whole activity history per user; without this it full-scans.
	(t) => [index('activity_user_action_idx').on(t.userId, t.action)]
);
export type InsertActivity = typeof activityTable.$inferInsert;
export type SelectActivity = typeof activityTable.$inferSelect;

export const pomodoroSessionTable = sqliteTable('pomodoro_session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id),
	// Nullable: an abandoned session, or one claimed from a logged-out browser, may have no task.
	task: text('task'),
	// The planned length in seconds (1500 for a standard 25 minutes). Actual focus time is
	// ended_at - started_at, so a session abandoned early keeps its real minutes.
	duration: integer('duration').notNull(),
	startedAt: integer('started_at', { mode: 'timestamp' }).notNull(),
	endedAt: integer('ended_at', { mode: 'timestamp' }).notNull(),
	completed: integer('completed', { mode: 'boolean' }).default(false).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull()
});
export type InsertPomodoroSession = typeof pomodoroSessionTable.$inferInsert;
export type SelectPomodoroSession = typeof pomodoroSessionTable.$inferSelect;
