import { describe, expect, it } from "vitest";

describe("DataJud API Key", () => {
  it("should have DATAJUD_API_KEY environment variable set", () => {
    // The key should be set via webdev_request_secrets
    const key = process.env.DATAJUD_API_KEY;
    expect(key).toBeDefined();
    expect(key).not.toBe("");
    expect(typeof key).toBe("string");
  });

  it("should be able to reach DataJud API endpoint", async () => {
    // Skip this test if API key is not configured
    const key = process.env.DATAJUD_API_KEY;
    if (!key || key.length < 30) {
      console.warn("DATAJUD_API_KEY not properly configured, skipping API test");
      return;
    }
    // Test with a real SERMAP process (execução fiscal TRF1) - number without punctuation
    const response = await fetch(
      "https://api-publica.datajud.cnj.jus.br/api_publica_trf1/_search",
      {
        method: "POST",
        headers: {
          "Authorization": `APIKey ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          size: 1,
          query: {
            match: {
              numeroProcesso: "10568343420204013300",
            },
          },
        }),
      }
    );

    // API should respond (not 403 or 500)
    expect(response.status).not.toBe(403);
    expect(response.status).not.toBe(500);
    
    // If 200, verify we can parse the response
    if (response.status === 200) {
      const data = await response.json();
      expect(data.hits).toBeDefined();
      // If process found, verify tribunal
      if (data.hits.total.value > 0) {
        expect(data.hits.hits[0]._source.tribunal).toBe("TRF1");
      }
    }
  });
});
