CREATE TABLE `user_session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`changed_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`user_id` text NOT NULL,
	`updated_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `auth_user` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`picture` text,
	`given_name` text,
	`family_name` text,
	`email_verified` text,
	`locale` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `auth_user_email_unique` ON `auth_user` (`email`);