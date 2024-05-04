-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `SequelizeMeta` (
	`name` numeric PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `memes` (
	`id` numeric PRIMARY KEY NOT NULL,
	`name` numeric NOT NULL,
	`createdAt` numeric NOT NULL,
	`updatedAt` numeric NOT NULL,
	`duration` real,
	`size` integer,
	`bit_rate` integer,
	`loudness_i` real,
	`loudness_lra` real,
	`loudness_tp` real,
	`loudness_thresh` real,
	`author_id` numeric,
	`playCount` integer DEFAULT 0 NOT NULL,
	`randomPlayCount` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `commands` (
	`name` numeric PRIMARY KEY NOT NULL,
	`memeId` integer,
	`createdAt` numeric NOT NULL,
	`updatedAt` numeric NOT NULL,
	FOREIGN KEY (`memeId`) REFERENCES `memes`(`id`) ON UPDATE cascade ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`name` numeric PRIMARY KEY NOT NULL,
	`createdAt` numeric NOT NULL,
	`updatedAt` numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE `MemeTags` (
	`memeId` integer NOT NULL,
	`tagName` numeric NOT NULL,
	`createdAt` numeric NOT NULL,
	`updatedAt` numeric NOT NULL,
	PRIMARY KEY(`memeId`, `tagName`),
	FOREIGN KEY (`tagName`) REFERENCES `tags`(`name`) ON UPDATE cascade ON DELETE cascade,
	FOREIGN KEY (`memeId`) REFERENCES `memes`(`id`) ON UPDATE cascade ON DELETE cascade
);

*/