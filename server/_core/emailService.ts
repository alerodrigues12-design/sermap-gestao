/**
 * Serviço para envio de emails com ata
 */

import nodemailer from "nodemailer";
import { ENV } from "./env";

// Configurar transporte de email
const transporter = nodemailer.createTransport({
  host: ENV.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(ENV.SMTP_PORT || "587"),
  secure: ENV.SMTP_SECURE === "true", // true para 465, false para outros
  auth: {
    user: ENV.SMTP_USER || "contato@consultoriaestrategicatributaria.com",
    pass: ENV.SMTP_PASSWORD,
  },
});

export interface EmailComAta {
  destinatarios: Array<{
    nome: string;
    email: string;
  }>;
  titulo: string;
  dataReuniao: string;
  ataHtml: string;
  ataPdf?: Buffer; // PDF da ata em bytes
  mensagem?: string;
}

/**
 * Envia email com a ata da reunião
 */
export async function enviarEmailComAta(dados: EmailComAta): Promise<{
  sucesso: boolean;
  mensagem: string;
  emailsEnviados: string[];
  erros: Array<{ email: string; erro: string }>;
}> {
  const emailsEnviados: string[] = [];
  const erros: Array<{ email: string; erro: string }> = [];

  for (const destinatario of dados.destinatarios) {
    try {
      const htmlContent = `
        <html>
          <body style="font-family: Arial, sans-serif; color: #333;">
            <h2>Ata de Reunião: ${dados.titulo}</h2>
            <p>Prezado(a) ${destinatario.nome},</p>
            <p>Segue em anexo a ata da reunião realizada em ${dados.dataReuniao}.</p>
            ${dados.mensagem ? `<p>${dados.mensagem}</p>` : ""}
            <p>Atenciosamente,<br>
            <strong>SERMAP Engenharia - Gestão Estratégica de Passivo</strong></p>
          </body>
        </html>
      `;

      const attachments: any[] = [];

      // Adicionar PDF se disponível
      if (dados.ataPdf) {
        attachments.push({
          filename: `ata-${dados.dataReuniao.replace(/\//g, "-")}.pdf`,
          content: dados.ataPdf,
          contentType: "application/pdf",
        });
      }

      await transporter.sendMail({
        from: `"SERMAP Gestão" <${ENV.SMTP_USER || "contato@consultoriaestrategicatributaria.com"}>`,
        to: destinatario.email,
        subject: `Ata de Reunião: ${dados.titulo}`,
        html: htmlContent,
        attachments,
      });

      emailsEnviados.push(destinatario.email);
      console.log(`[EmailService] Email enviado para ${destinatario.email}`);
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido";
      erros.push({
        email: destinatario.email,
        erro: mensagemErro,
      });
      console.error(`[EmailService] Erro ao enviar email para ${destinatario.email}:`, error);
    }
  }

  return {
    sucesso: erros.length === 0,
    mensagem: `${emailsEnviados.length} email(s) enviado(s) com sucesso${erros.length > 0 ? `, ${erros.length} erro(s)` : ""}`,
    emailsEnviados,
    erros,
  };
}

/**
 * Verifica se o transporte está configurado corretamente
 */
export async function verificarConexaoEmail(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log("[EmailService] Conexão SMTP verificada com sucesso");
    return true;
  } catch (error) {
    console.error("[EmailService] Erro ao verificar conexão SMTP:", error);
    return false;
  }
}
