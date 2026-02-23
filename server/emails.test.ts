import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb, insertEmail, getEmails, getEmailById, updateEmail, deleteEmail } from "./db";
import type { InsertEmail } from "../drizzle/schema";

describe("Emails CRUD Operations", () => {
  let emailId: number;
  const testEmail: InsertEmail = {
    remetente: "sheila@sermap.com",
    destinatario: "ale@consultoria.com",
    assunto: "Proposta de Gestão de Processos",
    conteudo: "Prezada Alessandra, segue em anexo a proposta de gestão de processos judiciais...",
    categoria: "proposta",
    dataEmail: "2026-02-23",
    arquivoUrl: null,
    arquivoKey: null,
    confidencial: true,
  };

  it("should insert an email", async () => {
    await insertEmail(testEmail);
    const emails = await getEmails();
    expect(emails.length).toBeGreaterThan(0);
    const inserted = emails.find(e => e.assunto === testEmail.assunto);
    expect(inserted).toBeDefined();
    if (inserted) {
      emailId = inserted.id;
    }
  });

  it("should retrieve all emails", async () => {
    const emails = await getEmails();
    expect(Array.isArray(emails)).toBe(true);
    expect(emails.length).toBeGreaterThan(0);
  });

  it("should retrieve email by id", async () => {
    const email = await getEmailById(emailId);
    expect(email).toBeDefined();
    expect(email?.assunto).toBe(testEmail.assunto);
    expect(email?.remetente).toBe(testEmail.remetente);
  });

  it("should update an email", async () => {
    const newAssunto = "Proposta Atualizada - Gestão de Processos";
    await updateEmail(emailId, { assunto: newAssunto });
    const updated = await getEmailById(emailId);
    expect(updated?.assunto).toBe(newAssunto);
  });

  it("should delete an email", async () => {
    await deleteEmail(emailId);
    const email = await getEmailById(emailId);
    expect(email).toBeUndefined();
  });

  it("should handle email with file attachment", async () => {
    const emailWithFile: InsertEmail = {
      ...testEmail,
      assunto: "E-mail com Anexo",
      arquivoUrl: "https://files.example.com/documento.pdf",
      arquivoKey: "emails/abc123-documento.pdf",
    };
    await insertEmail(emailWithFile);
    const emails = await getEmails();
    const withFile = emails.find(e => e.assunto === "E-mail com Anexo");
    expect(withFile?.arquivoUrl).toBe(emailWithFile.arquivoUrl);
    expect(withFile?.arquivoKey).toBe(emailWithFile.arquivoKey);
  });

  it("should maintain email categories", async () => {
    const categories: Array<"proposta" | "contrato" | "comunicacao" | "importante" | "outros"> = [
      "proposta",
      "contrato",
      "comunicacao",
      "importante",
      "outros",
    ];

    for (const cat of categories) {
      const email: InsertEmail = {
        ...testEmail,
        assunto: `Email - ${cat}`,
        categoria: cat,
      };
      await insertEmail(email);
    }

    const emails = await getEmails();
    categories.forEach(cat => {
      const found = emails.find(e => e.categoria === cat && e.assunto === `Email - ${cat}`);
      expect(found).toBeDefined();
    });
  });
});
