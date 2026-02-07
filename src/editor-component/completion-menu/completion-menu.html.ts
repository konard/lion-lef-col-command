import { html, TemplateResult } from 'lit';
import type { CompletionMenu } from './completion-menu.js';

export const template = (host: CompletionMenu): TemplateResult => html`
  <div class="completion-menu" role="listbox" aria-label="Completion suggestions">
    ${host.suggestions.map(
      (item, index) => html`
        <div
          class="completion-item"
          role="option"
          aria-selected="${index === host.selectedIndex}"
          @click="${() => host.selectItem(index)}"
          @mouseenter="${() => host.hoverItem(index)}"
        >
          <span>${item.text}</span>
          <span class="completion-source">${item.source}</span>
        </div>
      `,
    )}
  </div>
`;
