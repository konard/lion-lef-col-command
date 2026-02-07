import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./completion-menu.css.js";
import { template } from "./completion-menu.html.js";
import type { AICompletionSuggestion } from "../types/ai-types.js";

@customElement("completion-menu")
export class CompletionMenu extends LitElement {
  static styles = styles;

  @property({ type: Array })
  suggestions: AICompletionSuggestion[] = [];

  @property({ type: Number })
  selectedIndex = 0;

  @property({ type: Boolean, reflect: true })
  active = false;

  render() {
    return template(this);
  }

  selectItem(index: number): void {
    this.selectedIndex = index;
    this.dispatchEvent(
      new CustomEvent("completion-select", {
        detail: this.suggestions[index],
        bubbles: true,
        composed: true,
      }),
    );
  }

  hoverItem(index: number): void {
    this.selectedIndex = index;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "completion-menu": CompletionMenu;
  }
}
