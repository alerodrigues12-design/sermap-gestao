CREATE TABLE `processoAnexos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processoId` int NOT NULL,
	`tipoProcesso` enum('trabalhista','civel','pf') NOT NULL,
	`nomeArquivo` varchar(255) NOT NULL,
	`fileKey` text NOT NULL,
	`fileUrl` text NOT NULL,
	`tamanho` int,
	`analiseStatus` enum('pendente','processando','concluida','erro') NOT NULL DEFAULT 'pendente',
	`analiseResultado` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `processoAnexos_id` PRIMARY KEY(`id`)
);
