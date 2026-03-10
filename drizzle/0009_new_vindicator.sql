CREATE TABLE `processosPF` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero` varchar(60) NOT NULL,
	`tribunal` varchar(300) NOT NULL,
	`assunto` text,
	`valor` varchar(50),
	`partes` text,
	`status` enum('ativo','arquivado','extinto','a_verificar') NOT NULL DEFAULT 'a_verificar',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `processosPF_id` PRIMARY KEY(`id`)
);
