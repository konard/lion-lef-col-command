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

export interface MentionProvider {
  id: string;
  trigger: RegExp;
  onMatch: (match: RegExpMatchArray, blockId: string) => void;
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
  anchorPosition = { top: 0, left: 0 };

  @state()
  pendingMention: MentionMatch | null = null;

  customInlineTools: InlineTool[] = [];
  private mentionProviders: MentionProvider[] = [];

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
    this.registerDefaultMentionProvider();
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

  addMentionProvider(provider: MentionProvider): void {
    this.mentionProviders.push(provider);
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
          this.updateAnchorToFocusedBlock();
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
      const blockManager = this.shadowRoot?.querySelector("block-manager") as any;
      if (blockManager) {
        const textarea = blockManager.shadowRoot?.querySelector(
          `textarea[data-block-id="${e.detail.blockId}"]`,
        ) as HTMLTextAreaElement | null;
        if (textarea) {
          const start = textarea.selectionStart;
          const before = textarea.value.substring(0, start);
          const after = textarea.value.substring(textarea.selectionEnd);
          blockManager.updateBlockContent(e.detail.blockId, before + "\n" + after);
          this.updateComplete.then(() => {
            const el = blockManager.shadowRoot?.querySelector(
              `textarea[data-block-id="${e.detail.blockId}"]`,
            ) as HTMLTextAreaElement | null;
            if (el) {
              el.selectionStart = start + 1;
              el.selectionEnd = start + 1;
              blockManager.autoResizeTextarea(el);
            }
          });
        }
      }
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

    if (keyEvent.key === "Tab" && this.completionEnabled && !this.completionController.isActive) {
      const block = this.blocks.find((b) => b.id === e.detail.blockId);
      if (block) {
        const lastWord = this.getLastWord(block.content);
        if (lastWord && lastWord.length >= 2) {
          keyEvent.preventDefault();
          this.completionController.requestSuggestions(lastWord);
          this.updateAnchorToFocusedBlock();
        }
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
      const hostRect = this.getBoundingClientRect();
      this.anchorPosition = {
        top: rect.top - hostRect.top + rect.height / 2,
        left: rect.left - hostRect.left + rect.width / 2,
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

  private registerDefaultMentionProvider(): void {
    this.addMentionProvider({
      id: "ai",
      trigger: /@([\w.-]+)\s+(.*)/,
      onMatch: (match, blockId) => {
        const model = match[1];
        const query = match[2].trim();
        if (query.length > 0) {
          this.pendingMention = { model, query, blockId };
          this.showAIPanel = true;
          this.dispatchEvent(
            new CustomEvent("mention-trigger", {
              detail: { model, query, blockId },
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
      },
    });
  }

  private checkForMention(block: Block): void {
    for (const provider of this.mentionProviders) {
      const match = block.content.match(provider.trigger);
      if (match) {
        provider.onMatch(match, block.id);
        return;
      }
    }
  }

  private openCommandPalette(): void {
    this.updateAnchorToFocusedBlock();
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

  private updateAnchorToFocusedBlock(): void {
    const blockEl = this.getFocusedTextarea();
    if (blockEl) {
      const rect = blockEl.getBoundingClientRect();
      const hostRect = this.getBoundingClientRect();
      this.anchorPosition = {
        top: rect.bottom - hostRect.top,
        left: rect.left - hostRect.left,
      };
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
