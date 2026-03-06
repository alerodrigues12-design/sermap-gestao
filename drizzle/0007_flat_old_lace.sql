CREATE TABLE `governancaAssinaturas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`documentoId` int NOT NULL,
	`signatario` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`status` enum('pendente','assinado','recusado') NOT NULL DEFAULT 'pendente',
	`dataAssinatura` varchar(20),
	`linkAutentique` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `governancaAssinaturas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `governancaAtas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reuniaoId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text,
	`ataUrl` text,
	`ataKey` varchar(500),
	`dataAta` varchar(20) NOT NULL,
	`responsavel` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `governancaAtas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `governancaDocumentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`tipo` enum('politica','procedimento','norma','resolucao','estatuto','regimento','outro') NOT NULL,
	`versao` int DEFAULT 1,
	`status` enum('rascunho','em_aprovacao','aprovado','arquivado') NOT NULL DEFAULT 'rascunho',
	`documentoUrl` text,
	`documentoKey` varchar(500),
	`dataCriacao` varchar(20) NOT NULL,
	`dataAprovacao` varchar(20),
	`responsavel` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `governancaDocumentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `governancaGravacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reuniaoId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`linkGravacao` text NOT NULL,
	`duracao` varchar(20),
	`dataGravacao` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `governancaGravacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `governancaParticipantes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reuniaoId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`cargo` varchar(255),
	`confirmacao` enum('pendente','confirmado','recusado') DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `governancaParticipantes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `governancaReunioes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`dataReuniao` varchar(20) NOT NULL,
	`horaReuniao` varchar(10) NOT NULL,
	`local` varchar(255),
	`linkGoogleMeet` text,
	`status` enum('agendada','em_andamento','concluida','cancelada') NOT NULL DEFAULT 'agendada',
	`responsavel` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `governancaReunioes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `governancaAssinaturas` ADD CONSTRAINT `governancaAssinaturas_documentoId_governancaDocumentos_id_fk` FOREIGN KEY (`documentoId`) REFERENCES `governancaDocumentos`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `governancaAtas` ADD CONSTRAINT `governancaAtas_reuniaoId_governancaReunioes_id_fk` FOREIGN KEY (`reuniaoId`) REFERENCES `governancaReunioes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `governancaGravacoes` ADD CONSTRAINT `governancaGravacoes_reuniaoId_governancaReunioes_id_fk` FOREIGN KEY (`reuniaoId`) REFERENCES `governancaReunioes`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `governancaParticipantes` ADD CONSTRAINT `governancaParticipantes_reuniaoId_governancaReunioes_id_fk` FOREIGN KEY (`reuniaoId`) REFERENCES `governancaReunioes`(`id`) ON DELETE no action ON UPDATE no action;