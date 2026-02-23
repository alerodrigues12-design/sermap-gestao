CREATE TABLE `emails` (
	`id` int AUTO_INCREMENT NOT NULL,
	`remetente` varchar(255) NOT NULL,
	`destinatario` varchar(255) NOT NULL,
	`assunto` varchar(500) NOT NULL,
	`conteudo` text NOT NULL,
	`categoria` enum('proposta','contrato','comunicacao','importante','outros') DEFAULT 'outros',
	`dataEmail` varchar(20) NOT NULL,
	`arquivoUrl` text,
	`arquivoKey` varchar(500),
	`confidencial` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `emails_id` PRIMARY KEY(`id`)
);
