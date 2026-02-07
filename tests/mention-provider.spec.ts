import { describe, it, expect } from "bun:test";

interface MentionProvider {
  id: string;
  trigger: RegExp;
  onMatch: (match: RegExpMatchArray, blockId: string) => void;
}

describe("MentionProvider system", () => {
  it("should support multiple providers with different patterns", () => {
    const results: { provider: string; match: string }[] = [];

    const providers: MentionProvider[] = [
      {
        id: "ai",
        trigger: /@([\w.-]+)\s+(.*)/,
        onMatch: (match) => {
          results.push({ provider: "ai", match: match[1] });
        },
      },
      {
        id: "user",
        trigger: /@user:([\w]+)/,
        onMatch: (match) => {
          results.push({ provider: "user", match: match[1] });
        },
      },
    ];

    const text = "@gpt-4 hello world";
    for (const provider of providers) {
      const match = text.match(provider.trigger);
      if (match) {
        provider.onMatch(match, "block-1");
        break;
      }
    }

    expect(results.length).toBe(1);
    expect(results[0].provider).toBe("ai");
    expect(results[0].match).toBe("gpt-4");
  });

  it("should match user mention provider", () => {
    const results: { provider: string; match: string }[] = [];

    const providers: MentionProvider[] = [
      {
        id: "user",
        trigger: /@user:([\w]+)/,
        onMatch: (match) => {
          results.push({ provider: "user", match: match[1] });
        },
      },
      {
        id: "ai",
        trigger: /@([\w.-]+)\s+(.*)/,
        onMatch: (match) => {
          results.push({ provider: "ai", match: match[1] });
        },
      },
    ];

    const text = "@user:john_doe";
    for (const provider of providers) {
      const match = text.match(provider.trigger);
      if (match) {
        provider.onMatch(match, "block-1");
        break;
      }
    }

    expect(results.length).toBe(1);
    expect(results[0].provider).toBe("user");
    expect(results[0].match).toBe("john_doe");
  });

  it("should not match any provider for plain text", () => {
    const results: { provider: string }[] = [];

    const providers: MentionProvider[] = [
      {
        id: "ai",
        trigger: /@([\w.-]+)\s+(.*)/,
        onMatch: () => {
          results.push({ provider: "ai" });
        },
      },
    ];

    const text = "hello world";
    for (const provider of providers) {
      const match = text.match(provider.trigger);
      if (match) {
        provider.onMatch(match, "block-1");
        break;
      }
    }

    expect(results.length).toBe(0);
  });

  it("should stop at first matching provider", () => {
    const results: string[] = [];

    const providers: MentionProvider[] = [
      {
        id: "first",
        trigger: /@([\w]+)\s/,
        onMatch: () => results.push("first"),
      },
      {
        id: "second",
        trigger: /@([\w]+)/,
        onMatch: () => results.push("second"),
      },
    ];

    const text = "@model query";
    for (const provider of providers) {
      const match = text.match(provider.trigger);
      if (match) {
        provider.onMatch(match, "block-1");
        break;
      }
    }

    expect(results).toEqual(["first"]);
  });
});
