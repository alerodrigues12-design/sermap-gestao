CREATE TABLE `peticoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processoId` int NOT NULL,
	`tipoProcesso` enum('trabalhista','civel','pf') NOT NULL,
	`numeroProceso` varchar(60),
	`tipoPeticao` enum('excecao_pre_executividade','embargos_execucao','impugnacao','recurso_ordinario','agravo_peticao','contestacao','peticao_generica','excecao_incompetencia','nulidade_citacao','prescricao_decadencia') NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`conteudo` text NOT NULL,
	`urgencia` enum('critica','alta','media','baixa') NOT NULL DEFAULT 'media',
	`status` enum('rascunho','revisada','finalizada') NOT NULL DEFAULT 'rascunho',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `peticoes_id` PRIMARY KEY(`id`)
);
