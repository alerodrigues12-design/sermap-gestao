CREATE TABLE `prestacaoContas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tipo` enum('entrada','saida') NOT NULL,
	`descricao` varchar(255) NOT NULL,
	`valor` decimal(15,2) NOT NULL,
	`data` varchar(20) NOT NULL,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prestacaoContas_id` PRIMARY KEY(`id`)
);
