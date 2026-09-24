CREATE INDEX `activity_user_action_idx` ON `activity` (`user_id`,`action`);--> statement-breakpoint
CREATE INDEX `card_user_deleted_created_idx` ON `card` (`user_id`,`deleted`,`created_at`);--> statement-breakpoint
CREATE INDEX `card_user_deleted_next_idx` ON `card` (`user_id`,`deleted`,`next_practice`);