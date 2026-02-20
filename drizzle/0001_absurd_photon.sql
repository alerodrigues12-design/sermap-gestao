CREATE TABLE `documentos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`categoria` enum('contrato','honorarios','procuracao','outros') DEFAULT 'outros',
	`fileUrl` text,
	`fileKey` varchar(500),
	`confidencial` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `documentos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `movimentacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processoId` int NOT NULL,
	`dataMovimentacao` varchar(30),
	`descricao` text,
	`complemento` text,
	`fonte` varchar(50) DEFAULT 'datajud',
	`lida` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `movimentacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notificacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`processoId` int,
	`titulo` varchar(255) NOT NULL,
	`mensagem` text,
	`tipo` enum('movimentacao','prazo','alerta','info') DEFAULT 'info',
	`lida` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notificacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `passivoTributario` (
	`id` int AUTO_INCREMENT NOT NULL,
	`inscricao` varchar(50) NOT NULL,
	`tipo` varchar(100),
	`natureza` varchar(100),
	`situacao` varchar(100),
	`dataInscricao` varchar(20),
	`orgao` varchar(200),
	`receita` varchar(200),
	`processoJudicial` varchar(100),
	`valorTotal` decimal(15,2),
	`valorPrincipal` decimal(15,2),
	`valorMulta` decimal(15,2),
	`valorJuros` decimal(15,2),
	`valorEncargo` decimal(15,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `passivoTributario_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`numero` varchar(50) NOT NULL,
	`tipo` enum('trabalhista','civel','tributario','execucao_fiscal') NOT NULL,
	`sistema` enum('pje','esaj') NOT NULL DEFAULT 'pje',
	`orgao` varchar(255),
	`local` varchar(255),
	`autor` text,
	`reu` text,
	`assunto` text,
	`dataAutuacao` varchar(20),
	`observacoes` text,
	`valorCondenacao` decimal(15,2),
	`valorSentenca` decimal(15,2),
	`status` text,
	`perdaPrazo` boolean DEFAULT false,
	`risco` enum('alto','medio','baixo','indefinido') DEFAULT 'indefinido',
	`advogadoReclamante` text,
	`enderecoReclamante` text,
	`enderecoAdvogado` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `processos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `simulacoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(200) NOT NULL,
	`edital` varchar(200),
	`modalidade` varchar(200),
	`totalSemDesconto` decimal(15,2),
	`desconto` decimal(15,2),
	`totalAPagar` decimal(15,2),
	`prestacoes` int,
	`valorEntrada` decimal(15,2),
	`qtdEntrada` int,
	`valorParcela` decimal(15,2),
	`qtdParcelas` int,
	`dataAdesao` varchar(20),
	`viavel` boolean DEFAULT false,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `simulacoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `timelineItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descricao` text,
	`dataInicio` varchar(20),
	`dataFim` varchar(20),
	`status` enum('pendente','em_andamento','concluido') DEFAULT 'pendente',
	`ordem` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `timelineItems_id` PRIMARY KEY(`id`)
);
