CREATE TABLE `pomodoro_session` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`task` text,
	`duration` integer NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer NOT NULL,
	`completed` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
-- The rest of this file makes activity.card_id nullable, so a pomodoro session can log an
-- activity row with no card. SQLite cannot ALTER COLUMN, so it is a table rebuild.
--
-- The generated rebuild does not work as-is. ALTER TABLE ... RENAME reparses every trigger body
-- in the schema, and the four card triggers all write INSERT INTO activity, which at that instant
-- has just been dropped. The rename fails with "error in trigger log_card_insert: no such table:
-- main.activity" and leaves the database with no activity table at all.
--
-- PRAGMA legacy_alter_table=ON suppresses that reparse, but pragmas are connection-scoped and
-- Turso runs statements over HTTP, so a pragma that silently fails to apply would abort the
-- migration after activity had already been dropped. Dropping the triggers first has no such
-- dependency, so the triggers come off, the table is rebuilt, and they go back on unchanged.
DROP TRIGGER IF EXISTS log_card_insert;--> statement-breakpoint
DROP TRIGGER IF EXISTS log_card_update;--> statement-breakpoint
DROP TRIGGER IF EXISTS log_card_soft_delete;--> statement-breakpoint
DROP TRIGGER IF EXISTS log_card_delete;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_activity` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`card_id` text,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `card`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_activity`("id", "action", "card_id", "user_id", "created_at") SELECT "id", "action", "card_id", "user_id", "created_at" FROM `activity`;--> statement-breakpoint
DROP TABLE `activity`;--> statement-breakpoint
ALTER TABLE `__new_activity` RENAME TO `activity`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
-- Recreated exactly as they stood after 0003. Nothing about them changes.
CREATE TRIGGER log_card_insert
    AFTER INSERT ON card
BEGIN
    INSERT INTO activity(id,
    action,
    card_id,
    user_id,
    created_at)
VALUES(lower(hex(randomblob(16))),
    'INSERT',
    NEW.id,
    NEW.user_id,
    strftime('%s', 'now'));

END;
--> statement-breakpoint
CREATE TRIGGER log_card_update
    AFTER UPDATE ON card
    WHEN NEW.deleted = OLD.deleted
BEGIN
    INSERT INTO activity(id,
    action,
    card_id,
    user_id,
    created_at)
VALUES(lower(hex(randomblob(16))),
    'UPDATE',
    NEW.id,
    NEW.user_id,
    strftime('%s', 'now'));

END;
--> statement-breakpoint
CREATE TRIGGER log_card_soft_delete
    AFTER UPDATE ON card
    WHEN NEW.deleted = 1 AND OLD.deleted = 0
BEGIN
    INSERT INTO activity(id,
    action,
    card_id,
    user_id,
    created_at)
VALUES(lower(hex(randomblob(16))),
    'DELETE',
    NEW.id,
    NEW.user_id,
    strftime('%s', 'now'));

END;
--> statement-breakpoint
CREATE TRIGGER log_card_delete
    AFTER DELETE ON card
BEGIN
    INSERT INTO activity(id,
    action,
    card_id,
    user_id,
    created_at)
VALUES(lower(hex(randomblob(16))),
    'DELETE',
    OLD.id,
    OLD.user_id,
    strftime('%s', 'now'));

END;
--> statement-breakpoint
-- activity is written by triggers, not app code (see 0001), so pomodoro follows suit.
--
-- WHEN completed = 1: an abandoned session keeps its real minutes in pomodoro_session but stays
-- out of the heatmap, mirroring how log_card_update excludes soft deletes.
--
-- created_at is NEW.ended_at, not strftime('now'). A session run while logged out is claimed on
-- sign-up, possibly a month later; 'now' would paint the heatmap on the claim date instead of the
-- day the work happened.
--
-- card_id is left out entirely, which is why it had to become nullable above.
CREATE TRIGGER log_pomodoro_session
    AFTER INSERT ON pomodoro_session
    WHEN NEW.completed = 1
BEGIN
    INSERT INTO activity(id,
    action,
    user_id,
    created_at)
VALUES(lower(hex(randomblob(16))),
    'POMODORO',
    NEW.user_id,
    NEW.ended_at);

END;
