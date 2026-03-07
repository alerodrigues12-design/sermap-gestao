import { describe, it, expect } from "vitest";

describe("Autentique API Key", () => {
  it("should have AUTENTIQUE_API_KEY configured", () => {
    const key = process.env.AUTENTIQUE_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(10);
  });

  it("should authenticate successfully with the Autentique API", async () => {
    const key = process.env.AUTENTIQUE_API_KEY;
    if (!key) throw new Error("AUTENTIQUE_API_KEY not set");

    const query = `query { me { id name email } }`;

    const response = await fetch("https://api.autentique.com.br/v2/graphql", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    expect(response.status).toBe(200);

    const json = (await response.json()) as any;

    // Should not have authentication errors
    if (json.errors) {
      const authErr = json.errors.find((e: any) =>
        e.message?.toLowerCase().includes("unauthorized") ||
        e.message?.toLowerCase().includes("unauthenticated") ||
        e.extensions?.code === "UNAUTHENTICATED"
      );
      expect(authErr, `Auth error from Autentique: ${JSON.stringify(json.errors)}`).toBeUndefined();
    }

    expect(json.data?.me).toBeDefined();
    console.log(`✅ Autentique autenticado como: ${json.data?.me?.name} <${json.data?.me?.email}>`);
  }, 15000);
});
