CREATE TABLE `activity`(
    `id` text PRIMARY KEY NOT NULL,
    `action` text NOT NULL,
    `card_id` text NOT NULL,
    `user_id` text NOT NULL,
    `created_at` integer DEFAULT (unixepoch()) NOT NULL,
    FOREIGN KEY (`card_id`) REFERENCES `card`(`id`) ON UPDATE NO action ON DELETE NO action,
    FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE NO action ON DELETE NO action
);

--> statement-breakpoint
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

