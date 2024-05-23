import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text, } from 'drizzle-orm/sqlite-core';

export const userTable = sqliteTable('auth_user', {
	id: text('id').primaryKey(),
	email: text('email').unique().notNull(),
	name: text('name'),
	picture: text('picture'),
	givenName: text('given_name'),
	familyName: text('family_name'),
	emailVerified: text('email_verified'),
	locale: text('locale')
});

export const userSessionTable = sqliteTable('user_session', {
	id: text('id').primaryKey(),
	expiresAt: text("expires_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	changedAt: integer('changed_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => userTable.id, { onDelete: 'cascade' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
});

export const cardTable = sqliteTable('card', {
	id: text('id').primaryKey(),
	front: text('front').notNull(),
	back: text('back').notNull(),
	userId: text('user_id').notNull().references(() => userTable.id),
	easiness: real('easiness').notNull().default(2.5),
	interval: integer('interval').notNull().default(0),
	repetitions: integer('repetitions').notNull().default(0),
	nextPractice: integer('next_practice', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(CURRENT_TIMESTAMP)`),
})

export type InsertUser = typeof userTable.$inferInsert;
export type SelectUser = typeof userTable.$inferSelect;

export type InsertSession = typeof userSessionTable.$inferInsert;
export type SelectSession = typeof userSessionTable.$inferSelect;

export type InsertCard = typeof cardTable.$inferInsert;
export type SelectCard = typeof cardTable.$inferSelect;