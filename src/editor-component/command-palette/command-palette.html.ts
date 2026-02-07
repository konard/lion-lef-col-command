import { html, TemplateResult, nothing } from 'lit';
import type { CommandPalette } from './command-palette.js';

export const template = (host: CommandPalette): TemplateResult => html`
  <div class="palette" role="dialog" aria-label="Command palette">
    <div class="palette-search">
      <input
        type="text"
        placeholder="Type a command..."
        .value="${host.searchQuery}"
        @input="${host.handleSearchInput}"
        @keydown="${host.handleKeyDown}"
        aria-label="Search commands"
        aria-autocomplete="list"
      />
    </div>
    <div class="palette-list" role="listbox">
      ${host.filteredCommands.length === 0
        ? html`<div class="palette-empty">No commands found</div>`
        : host.filteredCommands.map(
            (result, index) => html`
              <div
                class="palette-item"
                role="option"
                aria-selected="${index === host.selectedIndex}"
                @click="${() => host.executeCommand(index)}"
                @mouseenter="${() => host.hoverItem(index)}"
              >
                ${result.command.icon
                  ? html`<span class="palette-item-icon">${result.command.icon}</span>`
                  : nothing}
                <div class="palette-item-info">
                  <span class="palette-item-label">${result.command.label}</span>
                  ${result.command.description
                    ? html`<span class="palette-item-desc">${result.command.description}</span>`
                    : nothing}
                </div>
                ${result.command.shortcut
                  ? html`<span class="palette-item-shortcut">${result.command.shortcut}</span>`
                  : nothing}
              </div>
            `,
          )}
    </div>
  </div>
`;
