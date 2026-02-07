import { html, TemplateResult } from "lit";
import type { EditorOutput } from "./editor-output.js";
import type { Block } from "../types/editor-types.js";

function renderOutputBlock(block: Block): TemplateResult {
  switch (block.type) {
    case "heading":
      return html`<h2 class="output-heading">${block.content}</h2>`;
    case "code":
      return html`<pre class="output-code"><code>${block.content}</code></pre>`;
    case "quote":
      return html`<blockquote class="output-quote">${block.content}</blockquote>`;
    case "divider":
      return html`
        <hr class="output-divider" />
      `;
    default:
      return html`<p class="output-paragraph">${block.content}</p>`;
  }
}

export const template = (host: EditorOutput): TemplateResult => html`
  <div class="output-root" role="article" aria-label="Editor output">
    ${
      host.blocks.length > 0
        ? host.blocks.map((block) => renderOutputBlock(block))
        : html`
            <p class="output-empty">No content</p>
          `
    }
  </div>
`;
