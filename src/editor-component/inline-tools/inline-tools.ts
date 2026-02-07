import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./inline-tools.css.js";
import { template } from "./inline-tools.html.js";

export interface InlineTool {
  id: string;
  label: string;
  icon?: string;
  action: (selectedText: string) => void | Promise<void>;
}

@customElement("inline-menu")
export class InlineTools extends LitElement {
  static styles = styles;

  @property({ type: Boolean, reflect: true })
  active = false;

  @property({ type: Array })
  tools: InlineTool[] = [];

  @property({ type: String })
  selectedText = "";

  render() {
    return template(this);
  }

  execFormat(command: string): void {
    if (command === "createLink") {
      const url = prompt("Enter URL:");
      if (url) {
        document.execCommand(command, false, url);
      }
    } else {
      document.execCommand(command, false);
    }
    this.dispatchEvent(
      new CustomEvent("format-applied", {
        detail: { command },
        bubbles: true,
        composed: true,
      }),
    );
  }

  handleCopy(): void {
    if (this.selectedText) {
      navigator.clipboard.writeText(this.selectedText).catch(() => {
        document.execCommand("copy");
      });
    }
  }

  execCustomTool(toolId: string): void {
    const tool = this.tools.find((t) => t.id === toolId);
    if (tool) {
      tool.action(this.selectedText);
    }
  }

  addTool(tool: InlineTool): void {
    this.tools = [...this.tools, tool];
  }

  removeTool(id: string): void {
    this.tools = this.tools.filter((t) => t.id !== id);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "inline-menu": InlineTools;
  }
}
