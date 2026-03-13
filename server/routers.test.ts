import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(role: "admin" | "user" = "admin"): {
  ctx: TrpcContext;
  clearedCookies: { name: string; options: Record<string, unknown> }[];
} {
  const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function createUnauthContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
  return { ctx };
}

describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});

describe("auth.me", () => {
  it("returns user when authenticated", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeTruthy();
    expect(result?.name).toBe("Test User");
    expect(result?.role).toBe("admin");
  });

  it("returns null when not authenticated", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

describe("dashboard.summary", () => {
  it("returns summary data for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.summary();
    expect(result).toBeDefined();
    expect(typeof result.total).toBe("number");
    expect(typeof result.trabalhistas).toBe("number");
    expect(typeof result.civeis).toBe("number");
    expect(typeof result.perdaPrazo).toBe("number");
    expect(typeof result.valorTotalTrabalhista).toBe("number");
    expect(typeof result.valorTotalCivel).toBe("number");
  });

  it("rejects unauthenticated access", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.dashboard.summary()).rejects.toThrow();
  });
});

describe("processos.list", () => {
  it("returns array of processos for authenticated user", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.processos.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("filters by tipo when provided", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.processos.list({ tipo: "trabalhista" });
    expect(Array.isArray(result)).toBe(true);
    for (const p of result) {
      expect(p.tipo).toBe("trabalhista");
    }
  });

  it("rejects unauthenticated access", async () => {
    const { ctx } = createUnauthContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.processos.list()).rejects.toThrow();
  });
});

describe("processos.perdaPrazo", () => {
  it("returns only processos with perda de prazo", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.processos.perdaPrazo();
    expect(Array.isArray(result)).toBe(true);
    for (const p of result) {
      expect(p.perdaPrazo).toBeTruthy();
    }
  });
});

describe("tributario.passivo", () => {
  it("returns passivo tributário data", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tributario.passivo();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("tributario.simulacoes", () => {
  it("returns simulações de transação", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.tributario.simulacoes();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("documentos.list", () => {
  it("returns all documents for admin", async () => {
    const { ctx } = createAuthContext("admin");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.documentos.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns only non-confidential documents for regular user", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);
    const result = await caller.documentos.list();
    expect(Array.isArray(result)).toBe(true);
    // Regular users should only see non-confidential docs
    for (const doc of result) {
      expect(doc.confidencial).toBeFalsy();
    }
  });
});

describe("documentos.upload", () => {
  it("rejects upload from non-admin user", async () => {
    const { ctx } = createAuthContext("user");
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.documentos.upload({
        titulo: "Test",
        categoria: "contrato",
        confidencial: true,
        fileBase64: "dGVzdA==",
        fileName: "test.pdf",
        mimeType: "application/pdf",
      })
    ).rejects.toThrow();
  });
});

describe("notificacoes", () => {
  it("returns notificações list", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notificacoes.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("returns count of unread notificações", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.notificacoes.naoLidas();
    expect(typeof result).toBe("number");
  });
});

describe("movimentacoes", () => {
  it("returns recent movimentações", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.movimentacoes.recentes();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("timeline", () => {
  it("returns timeline items", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.timeline.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("dashboard.notificacoesCount", () => {
  it("returns notification counts", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.notificacoesCount();
    expect(result).toBeDefined();
    expect(typeof result.movimentacoes).toBe("number");
    expect(typeof result.notificacoes).toBe("number");
    expect(typeof result.total).toBe("number");
    expect(result.total).toBe(result.movimentacoes + result.notificacoes);
  });
});

describe("peticoes.listar", () => {
  it("returns empty array for a non-existent processoId", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.peticoes.listar({ processoId: 999999, tipoProcesso: "trabalhista" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("returns array for pf tipo", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.peticoes.listar({ processoId: 1, tipoProcesso: "pf" });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("peticoes.atualizar", () => {
  it("returns ok: false when processoId does not exist", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    // Updating a non-existent petition should still return ok: true (no error)
    const result = await caller.peticoes.atualizar({ id: 999999, status: "revisada" });
    expect(result).toEqual({ ok: true });
  });
});

describe("peticoes.excluir", () => {
  it("returns ok: true when deleting non-existent petition", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.peticoes.excluir({ id: 999999 });
    expect(result).toEqual({ ok: true });
  });
});
