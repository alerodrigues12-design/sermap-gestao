import { createHash } from "crypto";
import type { Express, Request, Response } from "express";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { sdk } from "./_core/sdk";
import { getUserByUsername, getSystemConfig } from "./db";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export function registerLocalAuthRoutes(app: Express) {
  // Login with username/password
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Usuário e senha são obrigatórios." });
        return;
      }

      const user = await getUserByUsername(username);
      if (!user) {
        res.status(401).json({ error: "Usuário ou senha incorretos." });
        return;
      }

      const hashedInput = hashPassword(password);
      if (user.password !== hashedInput) {
        res.status(401).json({ error: "Usuário ou senha incorretos." });
        return;
      }

      // Create session token using the existing SDK
      const sessionToken = await sdk.createSessionToken(user.openId, {
        name: user.name || username,
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          role: user.role,
          username: user.username,
        },
      });
    } catch (error) {
      console.error("[LocalAuth] Login failed:", error);
      res.status(500).json({ error: "Erro interno ao fazer login." });
    }
  });

  // Verify documents password
  app.post("/api/auth/verify-docs-password", async (req: Request, res: Response) => {
    try {
      const { password } = req.body;

      if (!password) {
        res.status(400).json({ error: "Senha é obrigatória." });
        return;
      }

      const storedHash = await getSystemConfig("senha_documentos");
      if (!storedHash) {
        res.status(500).json({ error: "Senha de documentos não configurada." });
        return;
      }

      const hashedInput = hashPassword(password);
      if (storedHash !== hashedInput) {
        res.status(401).json({ error: "Senha incorreta." });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("[LocalAuth] Docs password verification failed:", error);
      res.status(500).json({ error: "Erro interno." });
    }
  });
}
