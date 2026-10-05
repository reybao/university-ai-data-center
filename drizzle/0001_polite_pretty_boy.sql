CREATE TABLE `chat_rate_limits` (
	`user_id` text NOT NULL,
	`window_start` text NOT NULL,
	`count` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `window_start`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `countries` (
	`code` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`scope_note` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `design_assumptions` (
	`id` text PRIMARY KEY NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	`unit` text,
	`evidence_type` text NOT NULL,
	`status` text NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `evidence_sources` (
	`id` text PRIMARY KEY NOT NULL,
	`publisher` text NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`published_at` text,
	`retrieved_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `indicators` (
	`id` text PRIMARY KEY NOT NULL,
	`country_code` text NOT NULL,
	`label` text NOT NULL,
	`value` text,
	`unit` text,
	`evidence_type` text NOT NULL,
	`reporting_period` text NOT NULL,
	`retrieved_at` text,
	`source_id` text,
	`method_note` text NOT NULL,
	`refresh_status` text DEFAULT 'static' NOT NULL,
	`last_success_at` text,
	`last_error_at` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`country_code`) REFERENCES `countries`(`code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `evidence_sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_indicators_country` ON `indicators` (`country_code`);--> statement-breakpoint
CREATE TABLE `research_claims` (
	`id` text PRIMARY KEY NOT NULL,
	`statement` text NOT NULL,
	`evidence_type` text NOT NULL,
	`source_id` text,
	`indicator_id` text,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `evidence_sources`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`indicator_id`) REFERENCES `indicators`(`id`) ON UPDATE no action ON DELETE no action
);
