import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./block-manager.css.js";
import { template } from "./block-manager.html.js";
import type { Block, BlockType } from "../types/editor-types.js";
import { generateId } from "../utils/dom-helpers.js";
import { DragDropController } from "../controllers/drag-drop-controller.js";

@customElement("block-manager")
export class BlockManager extends LitElement {
  static styles = styles;

  @property({ type: Array })
  blocks: Block[] = [{ id: generateId(), type: "paragraph", content: "" }];

  @property({ type: String })
  placeholder = "Start typing...";

  @property({ type: Boolean, attribute: "reorder-enabled" })
  reorderEnabled = true;

  @property({ type: String })
  focusedBlockId: string | null = null;

  dragController = new DragDropController(this, (fromId, toId, position) => {
    this.reorderBlock(fromId, toId, position);
  });

  render() {
    return template(this);
  }

  addBlock(type: BlockType = "paragraph"): Block {
    const block: Block = { id: generateId(), type, content: "" };
    this.blocks = [...this.blocks, block];
    this.emitChange(block.id, "insert");

    this.updateComplete.then(() => {
      const el = this.shadowRoot?.querySelector(
        `textarea[data-block-id="${block.id}"]`,
      ) as HTMLTextAreaElement | null;
      el?.focus();
    });

    return block;
  }

  removeBlock(blockId: string): void {
    if (this.blocks.length <= 1) return;
    this.blocks = this.blocks.filter((b) => b.id !== blockId);
    this.emitChange(blockId, "delete");
  }

  updateBlockContent(blockId: string, content: string): void {
    this.blocks = this.blocks.map((b) => (b.id === blockId ? { ...b, content } : b));
    this.emitChange(blockId, "update");
  }

  updateBlockType(blockId: string, type: BlockType): void {
    this.blocks = this.blocks.map((b) => (b.id === blockId ? { ...b, type } : b));
    this.emitChange(blockId, "update");
  }

  reorderBlock(fromId: string, toId: string, position: "above" | "below"): void {
    const fromIdx = this.blocks.findIndex((b) => b.id === fromId);
    const toIdx = this.blocks.findIndex((b) => b.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;

    const newBlocks = [...this.blocks];
    const [moved] = newBlocks.splice(fromIdx, 1);
    const insertIdx = position === "above" ? toIdx : toIdx + 1;
    const adjustedIdx = fromIdx < toIdx ? insertIdx - 1 : insertIdx;
    newBlocks.splice(adjustedIdx, 0, moved);
    this.blocks = newBlocks;
    this.emitChange(fromId, "reorder");
  }

  handleBlockInput(blockId: string, e: InputEvent): void {
    const target = e.target as HTMLTextAreaElement;
    this.updateBlockContent(blockId, target.value);
    this.autoResizeTextarea(target);
  }

  handleBlockKeyDown(blockId: string, e: KeyboardEvent): void {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      this.addBlock();
    }

    if (e.key === "Backspace") {
      const target = e.target as HTMLTextAreaElement;
      if (target.value === "" && this.blocks.length > 1) {
        e.preventDefault();
        const idx = this.blocks.findIndex((b) => b.id === blockId);
        this.removeBlock(blockId);
        if (idx > 0) {
          this.updateComplete.then(() => {
            const prevBlock = this.blocks[idx - 1];
            const el = this.shadowRoot?.querySelector(
              `textarea[data-block-id="${prevBlock.id}"]`,
            ) as HTMLTextAreaElement | null;
            el?.focus();
          });
        }
      }
    }

    this.dispatchEvent(
      new CustomEvent("block-keydown", {
        detail: { blockId, event: e },
        bubbles: true,
        composed: true,
      }),
    );
  }

  handleBlockFocus(blockId: string): void {
    this.focusedBlockId = blockId;
    this.dispatchEvent(
      new CustomEvent("block-focus", {
        detail: { blockId },
        bubbles: true,
        composed: true,
      }),
    );
  }

  handleBlockBlur(_blockId: string): void {
    this.dispatchEvent(
      new CustomEvent("block-blur", {
        detail: { blockId: _blockId },
        bubbles: true,
        composed: true,
      }),
    );
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
    this.requestUpdate();
  }

  autoResizeTextarea(textarea: HTMLTextAreaElement): void {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  private emitChange(blockId: string, type: "insert" | "update" | "delete" | "reorder"): void {
    this.dispatchEvent(
      new CustomEvent("blocks-change", {
        detail: { blocks: this.blocks, changedBlockId: blockId, type },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "block-manager": BlockManager;
  }
}
