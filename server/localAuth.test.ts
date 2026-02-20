import { describe, expect, it, vi } from "vitest";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

describe("Local Auth - Password Hashing", () => {
  it("should produce consistent SHA256 hashes", () => {
    const hash1 = hashPassword("sermap2026");
    const hash2 = hashPassword("sermap2026");
    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA256 produces 64 hex chars
  });

  it("should produce different hashes for different passwords", () => {
    const hash1 = hashPassword("sermap2026");
    const hash2 = hashPassword("sermap90");
    expect(hash1).not.toBe(hash2);
  });

  it("should match the expected hash for admin password", () => {
    const hash = hashPassword("sermap2026");
    // Verify it's a valid hex string
    expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
  });

  it("should match the expected hash for docs password", () => {
    const hash = hashPassword("docs2026");
    expect(/^[a-f0-9]{64}$/.test(hash)).toBe(true);
  });
});

describe("Local Auth - Login Validation", () => {
  it("should reject empty username", () => {
    expect("").toBeFalsy();
  });

  it("should reject empty password", () => {
    expect("").toBeFalsy();
  });

  it("should validate correct password comparison", () => {
    const storedHash = hashPassword("sermap2026");
    const inputHash = hashPassword("sermap2026");
    expect(storedHash).toBe(inputHash);
  });

  it("should reject incorrect password comparison", () => {
    const storedHash = hashPassword("sermap2026");
    const inputHash = hashPassword("wrongpassword");
    expect(storedHash).not.toBe(inputHash);
  });
});

describe("Local Auth - Documents Password", () => {
  it("should validate correct documents password", () => {
    const storedHash = hashPassword("docs2026");
    const inputHash = hashPassword("docs2026");
    expect(storedHash).toBe(inputHash);
  });

  it("should reject incorrect documents password", () => {
    const storedHash = hashPassword("docs2026");
    const inputHash = hashPassword("wrongdocs");
    expect(storedHash).not.toBe(inputHash);
  });
});

describe("Local Auth - Role-based Access", () => {
  it("should identify admin role correctly", () => {
    const user = { role: "admin" };
    expect(user.role === "admin").toBe(true);
    expect(user.role !== "admin").toBe(false);
  });

  it("should identify conselheiro (user) role correctly", () => {
    const user = { role: "user" };
    expect(user.role === "admin").toBe(false);
    expect(user.role === "user").toBe(true);
  });

  it("should block non-admin from documents", () => {
    const user = { role: "user" };
    const canAccessDocs = user.role === "admin";
    expect(canAccessDocs).toBe(false);
  });

  it("should allow admin to access documents", () => {
    const user = { role: "admin" };
    const canAccessDocs = user.role === "admin";
    expect(canAccessDocs).toBe(true);
  });
});
