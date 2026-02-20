import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@sermap.com",
      name: "Alessandra Hoffmann",
      loginMethod: "local",
      username: "admin",
      password: null,
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "user-conselheiro",
      email: "conselheiro@sermap.com",
      name: "Conselheiro",
      loginMethod: "local",
      username: "conselheiro",
      password: null,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as unknown as TrpcContext["res"],
  };
}

describe("recados router", () => {
  it("admin can list recados", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.recados.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("conselheiro can list recados", async () => {
    const caller = appRouter.createCaller(createUserContext());
    const result = await caller.recados.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("admin can get count of open recados", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.recados.abertos();
    expect(typeof result).toBe("number");
  });

  it("admin can create a recado", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.recados.create({
      tipo: "recado",
      prioridade: "media",
      titulo: "Teste de recado",
      mensagem: "Esta é uma mensagem de teste para verificar a funcionalidade.",
    });
    expect(result).toEqual({ success: true });
  });

  it("admin can create a pendencia with processo relacionado", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.recados.create({
      tipo: "pendencia",
      prioridade: "alta",
      titulo: "Documentação urgente",
      mensagem: "Preciso dos documentos do processo para dar andamento.",
      processoRelacionado: "0000141-18.2021.5.05.0196",
    });
    expect(result).toEqual({ success: true });
  });

  it("conselheiro cannot create recados (admin only)", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.recados.create({
        tipo: "recado",
        prioridade: "media",
        titulo: "Teste",
        mensagem: "Teste",
      })
    ).rejects.toThrow();
  });

  it("conselheiro cannot update recado status (admin only)", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(
      caller.recados.updateStatus({ id: 1, status: "concluido" })
    ).rejects.toThrow();
  });

  it("conselheiro cannot delete recados (admin only)", async () => {
    const caller = appRouter.createCaller(createUserContext());
    await expect(caller.recados.delete({ id: 1 })).rejects.toThrow();
  });

  it("list with status filter works", async () => {
    const caller = appRouter.createCaller(createAdminContext());
    const result = await caller.recados.list({ status: "aberto" });
    expect(Array.isArray(result)).toBe(true);
  });
});
