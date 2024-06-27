import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text, } from 'drizzle-orm/sqlite-core';

export const userTable = sqliteTable('auth_user', {
	id: text('id').primaryKey(),
	name: text('name'),
	given_name: text('given_name'),
	family_name: text('family_name'),
	picture: text('picture'),
	email: text('email').unique().notNull(),
	email_verified: integer('email_verified', { mode: 'boolean' }),
	locale: text('locale'),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).$onUpdate(() => new Date()).notNull(),
});
export type InsertUser = typeof userTable.$inferInsert;
export type SelectUser = typeof userTable.$inferSelect;


export const userSessionTable = sqliteTable('user_session', {
	id: text('id').primaryKey(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).$onUpdate(() => new Date()).notNull(),
});
export type InsertSession = typeof userSessionTable.$inferInsert;
export type SelectSession = typeof userSessionTable.$inferSelect;


export const cardTable = sqliteTable('card', {
	id: text('id').primaryKey(),
	front: text('front').notNull(),
	back: text('back').notNull(),
	userId: text('user_id').notNull().references(() => userTable.id),
	easiness: real('easiness').notNull().default(2.5),
	interval: integer('interval').notNull().default(1),
	repetitions: integer('repetitions').notNull().default(0),
	nextPractice: integer('next_practice', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).$onUpdate(() => new Date()).notNull(),
})
export type InsertCard = typeof cardTable.$inferInsert;
export type SelectCard = typeof cardTable.$inferSelect;

export const activityTable = sqliteTable('activity', {
	id: text('id').primaryKey(),
	action: text('action').notNull(),
	cardId: text('card_id').notNull().references(() => cardTable.id),
	userId: text('user_id').notNull().references(() => userTable.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`).notNull(),
});
export type InsertActivity = typeof activityTable.$inferInsert;
export type SelectActivity = typeof activityTable.$inferSelect;
