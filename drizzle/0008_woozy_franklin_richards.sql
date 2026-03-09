CREATE TABLE `accessLog` (
	`id` int AUTO_INCREMENT NOT NULL,
	`perfil` varchar(50) NOT NULL,
	`nivelAcesso` varchar(50) NOT NULL,
	`ip` varchar(100),
	`userAgent` text,
	`pagina` varchar(100) DEFAULT 'plano-estrategico',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `accessLog_id` PRIMARY KEY(`id`)
);
