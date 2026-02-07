import { html, TemplateResult, nothing } from "lit";
import type { BlockManager } from "./block-manager.js";
import type { Block } from "../types/editor-types.js";

function renderBlock(host: BlockManager, block: Block, index: number): TemplateResult {
  const dragState = host.dragController.state;
  const isDragging = dragState.draggedId === block.id;
  const isOverAbove = dragState.overId === block.id && dragState.position === "above";
  const isOverBelow = dragState.overId === block.id && dragState.position === "below";

  if (block.type === "divider") {
    return html`
      <hr class="block-divider" />
    `;
  }

  return html`
    <div
      class="block-wrapper ${isDragging ? "dragging" : ""} ${isOverAbove ? "drag-over-above" : ""} ${isOverBelow ? "drag-over-below" : ""}"
      data-block-id="${block.id}"
    >
      ${
        host.reorderEnabled
          ? html`
            <span
              class="drag-handle"
              draggable="true"
              @dragstart="${() => host.dragController.handleDragStart(block.id)}"
              @dragend="${() => host.dragController.handleDragEnd()}"
              aria-label="Drag to reorder"
            >
              &#x2807;
            </span>
          `
          : nothing
      }
      <textarea
        class="block-content"
        data-type="${block.type}"
        data-block-id="${block.id}"
        placeholder="${index === 0 ? host.placeholder : "Type something..."}"
        .value="${block.content}"
        @input="${(e: InputEvent) => host.handleBlockInput(block.id, e)}"
        @keydown="${(e: KeyboardEvent) => host.handleBlockKeyDown(block.id, e)}"
        @focus="${() => host.handleBlockFocus(block.id)}"
        @blur="${() => host.handleBlockBlur(block.id)}"
        @mouseup="${(e: MouseEvent) => host.handleTextSelect(block.id, e)}"
        @dragover="${(e: DragEvent) => host.dragController.handleDragOver(block.id, e)}"
        @drop="${() => host.dragController.handleDrop()}"
        aria-label="Block ${index + 1}"
        rows="1"
      ></textarea>
      <button
        class="block-settings-btn"
        @click="${() => host.handleSettingsClick(block.id)}"
        aria-label="Block settings"
        title="API settings"
      >
        &#x2699;
      </button>
    </div>
  `;
}

export const template = (host: BlockManager): TemplateResult => html`
  <div class="block-list" role="list" aria-label="Editor blocks">
    ${host.blocks.map((block, i) => renderBlock(host, block, i))}
  </div>
  <button class="add-block-btn" @click="${host.addBlock}" aria-label="Add new block">
    + Add block
  </button>
`;
