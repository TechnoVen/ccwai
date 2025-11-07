import fetch from "node-fetch";
import type { AIAdapter } from "./base.js";
import fs from "fs";

export class OpenAIAdapter implements AIAdapter {
  private config: any;

  constructor() {
    this.config = JSON.parse(fs.readFileSync("ccwai.config.json", "utf8"));
  }

  async chat(prompt: string): Promise<string> {
    const cfg = this.config.providers.openai;
    const apiKey = process.env[cfg.apiKeyEnv];

    if (!apiKey) throw new Error(`Missing ${cfg.apiKeyEnv}`);

    const res = await fetch(`${cfg.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: cfg.model,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data: any = await res.json();
    return data?.choices?.[0]?.message?.content ?? "No response.";
  }
}
