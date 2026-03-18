export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  datajudApiKey: process.env.DATAJUD_API_KEY ?? "",
  // Autentique
  AUTENTIQUE_API_KEY: process.env.AUTENTIQUE_API_KEY ?? "",
  // SMTP para envio de emails
  SMTP_HOST: process.env.SMTP_HOST ?? "smtp.gmail.com",
  SMTP_PORT: process.env.SMTP_PORT ?? "587",
  SMTP_USER: process.env.SMTP_USER ?? "contato@consultoriaestrategicatributaria.com",
  SMTP_PASSWORD: process.env.SMTP_PASSWORD ?? "",
  SMTP_SECURE: process.env.SMTP_SECURE ?? "false",
  // OpenAI para transcrição e IA
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ?? "",
  // S3 para armazenamento de arquivos
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET ?? "",
  AWS_S3_REGION: process.env.AWS_S3_REGION ?? "us-east-1",
};
