import { LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styles } from "./advanced-text-editor.css.js";
import { template } from "./advanced-text-editor.html.js";
import type { Block, EditorChangeEvent, BlockType } from "../types/editor-types.js";
import type { AIProvider, AICompletionSuggestion } from "../types/ai-types.js";
import type { CommandDefinition } from "../types/command-types.js";
import type { InlineTool } from "../inline-tools/inline-tools.js";
import { CompletionController } from "../controllers/completion-controller.js";
import { generateId } from "../utils/dom-helpers.js";

import "../block-manager/block-manager.js";
import "../completion-menu/completion-menu.js";
import "../command-palette/command-palette.js";
import "../inline-tools/inline-tools.js";
import "../ai-integration/ai-integration.js";

export interface MentionMatch {
  model: string;
  query: string;
  blockId: string;
}

@customElement("advanced-text-editor")
export class AdvancedTextEditor extends LitElement {
  static styles = styles;

  @property({ type: String })
  placeholder = "Start typing...";

  @property({ type: Boolean, attribute: "ai-enabled" })
  aiEnabled = false;

  @property({ type: Boolean, attribute: "completion-enabled" })
  completionEnabled = true;

  @property({ type: Boolean, attribute: "commands-enabled" })
  commandsEnabled = true;

  @property({ type: Boolean, attribute: "inline-tools-enabled" })
  inlineToolsEnabled = true;

  @property({ type: Boolean, attribute: "block-reorder-enabled" })
  blockReorderEnabled = true;

  @property({ type: Boolean, attribute: "read-only" })
  readOnly = false;

  @state()
  blocks: Block[] = [{ id: generateId(), type: "paragraph", content: "" }];

  @state()
  expanded = false;

  @state()
  showAIPanel = false;

  @state()
  commandPaletteActive = false;

  @state()
  inlineToolsActive = false;

  @state()
  selectedText = "";

  @state()
  completionPosition = { top: 0, left: 0 };

  @state()
  commandPalettePosition = { top: 0, left: 0 };

  @state()
  inlineToolsPosition = { top: 0, left: 0 };

  @state()
  pendingMention: MentionMatch | null = null;

  customInlineTools: InlineTool[] = [];

  completionController = new CompletionController(this);

  private focusedBlockId: string | null = null;
  private selectionCheckTimer: ReturnType<typeof setTimeout> | null = null;

  render() {
    return template(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (this.commandsEnabled) {
      this.registerDefaultCommands();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.selectionCheckTimer) clearTimeout(this.selectionCheckTimer);
  }

  setAIProvider(provider: AIProvider): void {
    this.aiEnabled = true;
    this.updateComplete.then(() => {
      const aiPanel = this.shadowRoot?.querySelector("ai-integration");
      if (aiPanel) {
        (aiPanel as any).setProvider(provider);
      }
    });
  }

  registerCommand(command: CommandDefinition): void {
    this.updateComplete.then(() => {
      const palette = this.shadowRoot?.querySelector("col-palette");
      if (palette) {
        (palette as any).registerCommand(command);
      }
    });
  }

  registerCommands(commands: CommandDefinition[]): void {
    this.updateComplete.then(() => {
      const palette = this.shadowRoot?.querySelector("col-palette");
      if (palette) {
        (palette as any).registerCommands(commands);
      }
    });
  }

  addInlineTool(tool: InlineTool): void {
    this.customInlineTools = [...this.customInlineTools, tool];
  }

  getContent(): string {
    return this.blocks.map((b) => b.content).join("\n");
  }

  setContent(content: string): void {
    const lines = content.split("\n").filter((l) => l.trim());
    if (lines.length === 0) {
      this.blocks = [{ id: generateId(), type: "paragraph", content: "" }];
    } else {
      this.blocks = lines.map((line) => ({
        id: generateId(),
        type: "paragraph" as BlockType,
        content: line,
      }));
    }
  }

  getBlocks(): Block[] {
    return [...this.blocks];
  }

  handleBlocksChange(e: CustomEvent<EditorChangeEvent>): void {
    this.blocks = e.detail.blocks;

    if (this.completionEnabled) {
      const block = this.blocks.find((b) => b.id === e.detail.changedBlockId);
      if (block) {
        this.completionController.learnFromText(block.content);
        const lastWord = this.getLastWord(block.content);
        if (lastWord) {
          this.completionController.requestSuggestions(lastWord);
          this.updateCompletionPosition();
        } else {
          this.completionController.dismiss();
        }
      }
    }

    const changedBlock = this.blocks.find((b) => b.id === e.detail.changedBlockId);
    if (changedBlock) {
      this.checkForMention(changedBlock);
    }

    this.dispatchEvent(
      new CustomEvent("editor-change", {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  handleBlockKeyDown(e: CustomEvent<{ blockId: string; event: KeyboardEvent }>): void {
    const { event: keyEvent } = e.detail;

    if (keyEvent.key === "Enter" && keyEvent.shiftKey) {
      keyEvent.preventDefault();
      this.expanded = !this.expanded;
      return;
    }

    if (keyEvent.key === "/" && this.commandsEnabled) {
      this.openCommandPalette();
      return;
    }

    if (this.completionController.isActive) {
      if (keyEvent.key === "ArrowDown") {
        keyEvent.preventDefault();
        this.completionController.selectNext();
        return;
      }
      if (keyEvent.key === "ArrowUp") {
        keyEvent.preventDefault();
        this.completionController.selectPrevious();
        return;
      }
      if (keyEvent.key === "Tab" || keyEvent.key === "Enter") {
        const selected = this.completionController.getSelected();
        if (selected) {
          keyEvent.preventDefault();
          this.applyCompletion(selected);
          return;
        }
      }
      if (keyEvent.key === "Escape") {
        this.completionController.dismiss();
        return;
      }
    }
  }

  handleBlockFocus(e: CustomEvent<{ blockId: string }>): void {
    this.focusedBlockId = e.detail.blockId;
  }

  handleBlockBlur(_e: CustomEvent<{ blockId: string }>): void {
    setTimeout(() => {
      this.completionController.dismiss();
    }, 200);
  }

  handleTextSelect(e: CustomEvent<{ text: string; rect: DOMRect }>): void {
    if (!this.inlineToolsEnabled) return;
    const { text, rect } = e.detail;
    if (text.length > 0) {
      this.selectedText = text;
      this.inlineToolsPosition = {
        top: rect.top - 44,
        left: rect.left + rect.width / 2,
      };
      this.inlineToolsActive = true;
    } else {
      this.inlineToolsActive = false;
      this.selectedText = "";
    }
  }

  handleCompletionSelect(e: CustomEvent<AICompletionSuggestion>): void {
    this.applyCompletion(e.detail);
  }

  handlePaletteClose(): void {
    this.commandPaletteActive = false;
  }

  handleFormatApplied(_e: CustomEvent): void {
    this.inlineToolsActive = false;
  }

  handleAIInsert(e: CustomEvent<{ text: string }>): void {
    const blockManager = this.shadowRoot?.querySelector("block-manager") as any;
    if (blockManager) {
      const block = blockManager.addBlock();
      blockManager.updateBlockContent(block.id, e.detail.text);
    }
  }

  toggleAIPanel(): void {
    this.showAIPanel = !this.showAIPanel;
  }

  private checkForMention(block: Block): void {
    const mentionRegex = /@([\w.-]+)\s+(.*)/;
    const match = block.content.match(mentionRegex);
    if (match) {
      const model = match[1];
      const query = match[2].trim();
      if (query.length > 0) {
        this.pendingMention = { model, query, blockId: block.id };
        this.showAIPanel = true;
        this.dispatchEvent(
          new CustomEvent("mention-trigger", {
            detail: { model, query, blockId: block.id },
            bubbles: true,
            composed: true,
          }),
        );

        this.updateComplete.then(() => {
          const aiPanel = this.shadowRoot?.querySelector("ai-integration") as any;
          if (aiPanel) {
            aiPanel.prompt = `[${model}] ${query}`;
            aiPanel.sendPrompt();
          }
        });
      }
    }
  }

  private openCommandPalette(): void {
    const blockEl = this.getFocusedTextarea();
    if (blockEl) {
      const rect = blockEl.getBoundingClientRect();
      this.commandPalettePosition = { top: rect.bottom + 4, left: rect.left };
    }
    this.commandPaletteActive = true;

    this.updateComplete.then(() => {
      const palette = this.shadowRoot?.querySelector("col-palette") as any;
      palette?.open({
        editor: this,
        blockId: this.focusedBlockId ?? undefined,
      });
    });
  }

  private applyCompletion(suggestion: AICompletionSuggestion): void {
    if (!this.focusedBlockId) return;

    const blockManager = this.shadowRoot?.querySelector("block-manager") as any;
    const block = this.blocks.find((b) => b.id === this.focusedBlockId);
    if (!block || !blockManager) return;

    const lastWord = this.getLastWord(block.content);
    if (lastWord) {
      const newContent =
        block.content.slice(0, block.content.length - lastWord.length) + suggestion.text;
      blockManager.updateBlockContent(this.focusedBlockId, newContent);
    }

    this.completionController.learnWord(suggestion.text);
    this.completionController.dismiss();
  }

  private updateCompletionPosition(): void {
    const blockEl = this.getFocusedTextarea();
    if (blockEl) {
      const rect = blockEl.getBoundingClientRect();
      this.completionPosition = { top: rect.bottom + 4, left: rect.left };
    }
  }

  private getFocusedTextarea(): HTMLTextAreaElement | null {
    if (!this.focusedBlockId) return null;
    return this.shadowRoot
      ?.querySelector("block-manager")
      ?.shadowRoot?.querySelector(
        `textarea[data-block-id="${this.focusedBlockId}"]`,
      ) as HTMLTextAreaElement | null;
  }

  private getLastWord(text: string): string {
    const match = text.match(/(\S+)$/);
    return match ? match[1] : "";
  }

  private registerDefaultCommands(): void {
    const commands: CommandDefinition[] = [
      {
        id: "heading",
        label: "Heading",
        description: "Turn block into a heading",
        icon: "H",
        category: "basic",
        execute: (ctx) => {
          const blockManager = this.shadowRoot?.querySelector("block-manager") as any;
          if (blockManager && ctx.blockId) {
            blockManager.updateBlockType(ctx.blockId, "heading");
          }
        },
      },
      {
        id: "code",
        label: "Code Block",
        description: "Insert a code block",
        icon: "<>",
        category: "basic",
        execute: (ctx) => {
          const blockManager = this.shadowRoot?.querySelector("block-manager") as any;
          if (blockManager && ctx.blockId) {
            blockManager.updateBlockType(ctx.blockId, "code");
          }
        },
      },
      {
        id: "quote",
        label: "Quote",
        description: "Turn block into a quote",
        icon: '"',
        category: "basic",
        execute: (ctx) => {
          const blockManager = this.shadowRoot?.querySelector("block-manager") as any;
          if (blockManager && ctx.blockId) {
            blockManager.updateBlockType(ctx.blockId, "quote");
          }
        },
      },
      {
        id: "divider",
        label: "Divider",
        description: "Insert a horizontal divider",
        icon: "\u2014",
        category: "basic",
        execute: () => {
          const blockManager = this.shadowRoot?.querySelector("block-manager") as any;
          if (blockManager) {
            blockManager.addBlock("divider");
          }
        },
      },
      {
        id: "paragraph",
        label: "Paragraph",
        description: "Turn block into a paragraph",
        icon: "P",
        category: "basic",
        execute: (ctx) => {
          const blockManager = this.shadowRoot?.querySelector("block-manager") as any;
          if (blockManager && ctx.blockId) {
            blockManager.updateBlockType(ctx.blockId, "paragraph");
          }
        },
      },
    ];

    this.registerCommands(commands);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "advanced-text-editor": AdvancedTextEditor;
  }
}
