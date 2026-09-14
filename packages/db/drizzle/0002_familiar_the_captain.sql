CREATE TABLE `laws_docs` (
	`id` text PRIMARY KEY NOT NULL,
	`folder_id` text,
	`content` text DEFAULT '' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`folder_id`) REFERENCES `folders`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `laws_docs_folderId_idx` ON `laws_docs` (`folder_id`);