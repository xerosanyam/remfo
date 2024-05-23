CREATE TABLE `card` (
	`id` text PRIMARY KEY NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`user_id` text NOT NULL,
	`easiness` real DEFAULT 2.5 NOT NULL,
	`interval` integer DEFAULT 0 NOT NULL,
	`repetitions` integer DEFAULT 0 NOT NULL,
	`next_practice` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `auth_user`(`id`) ON UPDATE no action ON DELETE no action
);
