import { describe, it, expect } from "bun:test";
import type { AIModelConfig } from "../src/editor-component/ai-integration/ai-integration.js";

describe("AIModelConfig", () => {
  it("should have default values", () => {
    const config: AIModelConfig = {
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 1024,
    };
    expect(config.model).toBe("gpt-4");
    expect(config.temperature).toBe(0.7);
    expect(config.maxTokens).toBe(1024);
  });

  it("should allow updating individual fields", () => {
    const config: AIModelConfig = {
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 1024,
    };

    const updated = { ...config, model: "claude-3.5" };
    expect(updated.model).toBe("claude-3.5");
    expect(updated.temperature).toBe(0.7);
    expect(updated.maxTokens).toBe(1024);
  });

  it("should support temperature range 0-2", () => {
    const config: AIModelConfig = {
      model: "gpt-4",
      temperature: 0,
      maxTokens: 1024,
    };
    expect(config.temperature).toBe(0);

    const config2: AIModelConfig = {
      model: "gpt-4",
      temperature: 2,
      maxTokens: 1024,
    };
    expect(config2.temperature).toBe(2);
  });

  it("should allow high maxTokens values", () => {
    const config: AIModelConfig = {
      model: "gpt-4",
      temperature: 0.7,
      maxTokens: 32000,
    };
    expect(config.maxTokens).toBe(32000);
  });

  it("should support model names with dots and dashes", () => {
    const models = ["gpt-4", "gpt-4.5", "claude-3.5-sonnet", "gemini-2.0-flash"];
    for (const model of models) {
      const config: AIModelConfig = { model, temperature: 0.7, maxTokens: 1024 };
      expect(config.model).toBe(model);
    }
  });
});
