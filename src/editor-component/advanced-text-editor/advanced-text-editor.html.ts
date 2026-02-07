import { html, TemplateResult, nothing } from "lit";
import type { AdvancedTextEditor } from "./advanced-text-editor.js";

export const template = (host: AdvancedTextEditor): TemplateResult => html`
  <div class="editor-root">
    <div class="editor-body ${host.expanded ? "expanded" : ""}">
      <block-manager
        .blocks="${host.blocks}"
        .placeholder="${host.placeholder}"
        ?reorder-enabled="${host.blockReorderEnabled}"
        @blocks-change="${host.handleBlocksChange}"
        @block-keydown="${host.handleBlockKeyDown}"
        @block-focus="${host.handleBlockFocus}"
        @block-blur="${host.handleBlockBlur}"
      ></block-manager>
    </div>

    <div class="editor-footer">
      <div class="editor-footer-left">
        <span class="footer-hint">
          Type / for commands${host.completionEnabled ? " | Tab for completions" : ""}
          | @model for AI
        </span>
      </div>
      <div class="editor-footer-right">
        <span class="footer-hint">Shift+Enter to expand</span>
        ${
          host.aiEnabled
            ? html`
              <button
                class="ai-toggle-btn ${host.showAIPanel ? "active" : ""}"
                @click="${host.toggleAIPanel}"
                aria-label="Toggle AI panel"
                popovertarget="ai-config-popover"
              >
                AI
              </button>
            `
            : nothing
        }
      </div>
    </div>

    ${
      host.showAIPanel && host.aiEnabled
        ? html`
          <ai-integration
            .context="${host.getContent()}"
            @ai-insert="${host.handleAIInsert}"
          ></ai-integration>
        `
        : nothing
    }
  </div>

  <completion-menu
    .suggestions="${host.completionController.suggestions}"
    .selectedIndex="${host.completionController.selectedIndex}"
    ?active="${host.completionController.isActive}"
    @completion-select="${host.handleCompletionSelect}"
    style="top:${host.completionPosition.top}px;left:${host.completionPosition.left}px"
    popover="manual"
  ></completion-menu>

  <col-palette
    ?active="${host.commandPaletteActive}"
    style="top:${host.commandPalettePosition.top}px;left:${host.commandPalettePosition.left}px"
    @palette-close="${host.handlePaletteClose}"
    popover="manual"
  ></col-palette>

  <inline-menu
    ?active="${host.inlineToolsActive}"
    .selectedText="${host.selectedText}"
    .tools="${host.customInlineTools}"
    style="top:${host.inlineToolsPosition.top}px;left:${host.inlineToolsPosition.left}px"
    @format-applied="${host.handleFormatApplied}"
    popover="manual"
  ></inline-menu>
`;
