import fetch from "node-fetch";
import type { AIAdapter } from "./base.js";
import fs from "fs";

export class GeminiAdapter implements AIAdapter {
  private config: any;

  constructor() {
    this.config = JSON.parse(fs.readFileSync("ccwai.config.json", "utf8"));
  }

  async chat(prompt: string): Promise<string> {
    const cfg = this.config.providers.gemini;
    const apiKey = process.env[cfg.apiKeyEnv];

    if (!apiKey) throw new Error(`Missing ${cfg.apiKeyEnv}`);

    const res = await fetch(
      `${cfg.baseUrl}/models/${cfg.model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const json: any = await res.json();
    return json?.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response.";
  }
}
