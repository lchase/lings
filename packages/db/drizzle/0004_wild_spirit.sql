CREATE TABLE `bots` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`system_prompt` text DEFAULT '' NOT NULL,
	`tools_config` text DEFAULT '[]' NOT NULL,
	`delegation_allowlist` text DEFAULT '[]' NOT NULL,
	`avatar_seed` text NOT NULL,
	`default_model_tier` text DEFAULT 'balanced' NOT NULL,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL
);
--> statement-breakpoint
ALTER TABLE `agent_sessions` ADD `bot_id` text NOT NULL REFERENCES bots(id);--> statement-breakpoint
CREATE INDEX `agent_sessions_botId_idx` ON `agent_sessions` (`bot_id`);