import { LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styles } from "./command-palette.css.js";
import { template } from "./command-palette.html.js";
import type {
  CommandDefinition,
  CommandContext,
  CommandSearchResult,
} from "../types/command-types.js";
import { fuzzyMatch } from "../utils/dom-helpers.js";

@customElement("command-palette")
export class CommandPalette extends LitElement {
  static styles = styles;

  @property({ type: Boolean, reflect: true })
  active = false;

  @state()
  searchQuery = "";

  @state()
  selectedIndex = 0;

  @state()
  filteredCommands: CommandSearchResult[] = [];

  private commands: CommandDefinition[] = [];
  private context: CommandContext | null = null;

  render() {
    return template(this);
  }

  registerCommand(command: CommandDefinition): void {
    const existing = this.commands.findIndex((c) => c.id === command.id);
    if (existing >= 0) {
      this.commands[existing] = command;
    } else {
      this.commands.push(command);
    }
  }

  registerCommands(commands: CommandDefinition[]): void {
    for (const cmd of commands) {
      this.registerCommand(cmd);
    }
  }

  unregisterCommand(id: string): void {
    this.commands = this.commands.filter((c) => c.id !== id);
  }

  open(context: CommandContext): void {
    this.context = context;
    this.searchQuery = "";
    this.selectedIndex = 0;
    this.filterCommands();
    this.active = true;
    this.requestUpdate();
    this.updateComplete.then(() => {
      const input = this.shadowRoot?.querySelector("input");
      input?.focus();
    });
  }

  close(): void {
    this.active = false;
    this.searchQuery = "";
    this.filteredCommands = [];
    this.dispatchEvent(new CustomEvent("palette-close", { bubbles: true, composed: true }));
  }

  handleSearchInput(e: InputEvent): void {
    this.searchQuery = (e.target as HTMLInputElement).value;
    this.selectedIndex = 0;
    this.filterCommands();
  }

  handleKeyDown(e: KeyboardEvent): void {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % Math.max(this.filteredCommands.length, 1);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.selectedIndex =
          (this.selectedIndex - 1 + this.filteredCommands.length) %
          Math.max(this.filteredCommands.length, 1);
        break;
      case "Enter":
        e.preventDefault();
        this.executeCommand(this.selectedIndex);
        break;
      case "Escape":
        e.preventDefault();
        this.close();
        break;
    }
  }

  executeCommand(index: number): void {
    const result = this.filteredCommands[index];
    if (result && this.context) {
      result.command.execute(this.context);
      this.close();
    }
  }

  hoverItem(index: number): void {
    this.selectedIndex = index;
  }

  private filterCommands(): void {
    const available = this.commands.filter((c) => !c.disabled);

    if (!this.searchQuery) {
      this.filteredCommands = available.map((command) => ({
        command,
        matchScore: 0,
        matchedChars: [],
      }));
      return;
    }

    const results: CommandSearchResult[] = [];
    for (const command of available) {
      const { score, matched } = fuzzyMatch(this.searchQuery, command.label);
      if (score > 0) {
        results.push({ command, matchScore: score, matchedChars: matched });
      }
    }

    results.sort((a, b) => b.matchScore - a.matchScore);
    this.filteredCommands = results;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "command-palette": CommandPalette;
  }
}
