PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_rel_user_follow` (
	`follower_id` text NOT NULL,
	`followee_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	PRIMARY KEY(`follower_id`, `followee_id`),
	FOREIGN KEY (`follower_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`followee_id`) REFERENCES `user`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_rel_user_follow`("follower_id", "followee_id", "created_at", "updated_at") SELECT "follower_id", "followee_id", "created_at", "updated_at" FROM `rel_user_follow`;--> statement-breakpoint
DROP TABLE `rel_user_follow`;--> statement-breakpoint
ALTER TABLE `__new_rel_user_follow` RENAME TO `rel_user_follow`;--> statement-breakpoint
PRAGMA foreign_keys=ON;