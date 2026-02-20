CREATE TABLE `recados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`autorId` int NOT NULL,
	`autorNome` varchar(255),
	`tipo` enum('pendencia','recado','solicitacao','atualizacao') NOT NULL DEFAULT 'recado',
	`prioridade` enum('alta','media','baixa') NOT NULL DEFAULT 'media',
	`titulo` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`status` enum('aberto','em_andamento','concluido') NOT NULL DEFAULT 'aberto',
	`processoRelacionado` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recados_id` PRIMARY KEY(`id`)
);
