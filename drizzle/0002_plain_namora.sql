CREATE TABLE `systemConfig` (
	`id` int AUTO_INCREMENT NOT NULL,
	`chave` varchar(100) NOT NULL,
	`valor` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `systemConfig_id` PRIMARY KEY(`id`),
	CONSTRAINT `systemConfig_chave_unique` UNIQUE(`chave`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255);