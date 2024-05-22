import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('auth_user', {
	id: text('id').primaryKey(),
	email: text('email').unique().notNull(),
	name: text('name'),
	picture: text('picture'),
	givenName: text('given_name'),
	familyName: text('family_name'),
	emailVerified: text('email_verified'),
	locale: text('locale')
});

export const postsTable = sqliteTable('user_session', {
	id: text('id').primaryKey(),
	expiresAt: text("expires_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	changedAt: integer('changed_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`).notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertPost = typeof postsTable.$inferInsert;
export type SelectPost = typeof postsTable.$inferSelect;