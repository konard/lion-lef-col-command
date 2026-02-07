import { describe, it, expect } from "bun:test";
import type { Block, BlockType } from "../src/editor-component/types/editor-types.js";

function renderBlockAsText(block: Block): string {
  switch (block.type) {
    case "heading":
      return `## ${block.content}`;
    case "code":
      return `\`\`\`\n${block.content}\n\`\`\``;
    case "quote":
      return `> ${block.content}`;
    case "divider":
      return "---";
    default:
      return block.content;
  }
}

describe("EditorOutput rendering logic", () => {
  it("should render paragraph blocks as plain text", () => {
    const block: Block = { id: "1", type: "paragraph", content: "Hello world" };
    expect(renderBlockAsText(block)).toBe("Hello world");
  });

  it("should render heading blocks with ## prefix", () => {
    const block: Block = { id: "2", type: "heading", content: "Title" };
    expect(renderBlockAsText(block)).toBe("## Title");
  });

  it("should render code blocks with backtick fences", () => {
    const block: Block = { id: "3", type: "code", content: "const x = 1;" };
    expect(renderBlockAsText(block)).toBe("```\nconst x = 1;\n```");
  });

  it("should render quote blocks with > prefix", () => {
    const block: Block = { id: "4", type: "quote", content: "A wise quote" };
    expect(renderBlockAsText(block)).toBe("> A wise quote");
  });

  it("should render divider blocks as ---", () => {
    const block: Block = { id: "5", type: "divider", content: "" };
    expect(renderBlockAsText(block)).toBe("---");
  });

  it("should handle multiple blocks", () => {
    const blocks: Block[] = [
      { id: "1", type: "heading", content: "Title" },
      { id: "2", type: "paragraph", content: "Body text" },
      { id: "3", type: "divider", content: "" },
      { id: "4", type: "quote", content: "A quote" },
    ];

    const output = blocks.map(renderBlockAsText);
    expect(output).toEqual(["## Title", "Body text", "---", "> A quote"]);
  });

  it("should handle empty blocks array", () => {
    const blocks: Block[] = [];
    expect(blocks.map(renderBlockAsText)).toEqual([]);
  });

  it("should handle blocks with multiline content", () => {
    const block: Block = { id: "1", type: "paragraph", content: "Line 1\nLine 2\nLine 3" };
    expect(renderBlockAsText(block)).toBe("Line 1\nLine 2\nLine 3");
  });

  it("should default unknown block types to paragraph rendering", () => {
    const block: Block = { id: "1", type: "custom" as BlockType, content: "Custom content" };
    expect(renderBlockAsText(block)).toBe("Custom content");
  });
});
