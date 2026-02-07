import { html, TemplateResult } from 'lit';
import type { InlineTools } from './inline-tools.js';

export const template = (host: InlineTools): TemplateResult => html`
  <div class="toolbar" role="toolbar" aria-label="Text formatting tools">
    <button
      class="tool-btn"
      @click="${() => host.execFormat('bold')}"
      title="Bold"
      aria-label="Bold"
    >
      <strong>B</strong>
    </button>
    <button
      class="tool-btn"
      @click="${() => host.execFormat('italic')}"
      title="Italic"
      aria-label="Italic"
    >
      <em>I</em>
    </button>
    <button
      class="tool-btn"
      @click="${() => host.execFormat('underline')}"
      title="Underline"
      aria-label="Underline"
    >
      <u>U</u>
    </button>
    <button
      class="tool-btn"
      @click="${() => host.execFormat('strikeThrough')}"
      title="Strikethrough"
      aria-label="Strikethrough"
    >
      <s>S</s>
    </button>

    <div class="separator"></div>

    <button
      class="tool-btn"
      @click="${() => host.execFormat('createLink')}"
      title="Add link"
      aria-label="Add link"
    >
      🔗
    </button>
    <button
      class="tool-btn"
      @click="${() => host.handleCopy()}"
      title="Copy"
      aria-label="Copy"
    >
      📋
    </button>

    <div class="separator"></div>

    ${host.tools.map(
      (tool) => html`
        <button
          class="tool-btn"
          @click="${() => host.execCustomTool(tool.id)}"
          title="${tool.label}"
          aria-label="${tool.label}"
        >
          ${tool.icon ?? tool.label.charAt(0)}
        </button>
      `,
    )}
  </div>
`;
