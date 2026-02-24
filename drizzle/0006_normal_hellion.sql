CREATE TABLE `planoAcao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`status` enum('nao_iniciado','em_andamento','concluido','bloqueado') NOT NULL DEFAULT 'nao_iniciado',
	`dataPrevista` varchar(20),
	`dataFinalizada` varchar(20),
	`responsavel` varchar(255),
	`percentualConclusao` int DEFAULT 0,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planoAcao_id` PRIMARY KEY(`id`)
);
