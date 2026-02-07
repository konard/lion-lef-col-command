import { describe, it, expect } from "bun:test";

const mentionRegex = /@([\w.-]+)\s+(.*)/;

describe("@mention detection", () => {
  it("should detect @model-name followed by a query", () => {
    const text = "@gpt-5.2 What is the meaning of life?";
    const match = text.match(mentionRegex);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("gpt-5.2");
    expect(match![2]).toBe("What is the meaning of life?");
  });

  it("should detect @model with simple names", () => {
    const text = "@claude hello world";
    const match = text.match(mentionRegex);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("claude");
    expect(match![2]).toBe("hello world");
  });

  it("should detect @model with dots in name", () => {
    const text = "@gpt-4.5 explain quantum computing";
    const match = text.match(mentionRegex);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("gpt-4.5");
    expect(match![2]).toBe("explain quantum computing");
  });

  it("should not match @ without model name", () => {
    const text = "@ something";
    const match = text.match(mentionRegex);
    expect(match).toBeNull();
  });

  it("should not match @model without query", () => {
    const text = "@gpt-4";
    const match = text.match(mentionRegex);
    expect(match).toBeNull();
  });

  it("should not match plain text without @", () => {
    const text = "hello world";
    const match = text.match(mentionRegex);
    expect(match).toBeNull();
  });

  it("should handle @model with underscores", () => {
    const text = "@my_model summarize this";
    const match = text.match(mentionRegex);
    expect(match).not.toBeNull();
    expect(match![1]).toBe("my_model");
    expect(match![2]).toBe("summarize this");
  });

  it("should require a space between model and query", () => {
    const text = "@gpt-4query";
    const match = text.match(mentionRegex);
    expect(match).toBeNull();
  });

  it("should handle trailing whitespace in query", () => {
    const text = "@model hello world   ";
    const match = text.match(mentionRegex);
    expect(match).not.toBeNull();
    expect(match![2].trim()).toBe("hello world");
  });
});
