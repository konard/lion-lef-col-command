import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./editor-output.css.js";
import { template } from "./editor-output.html.js";
import type { Block } from "../types/editor-types.js";

@customElement("col-output")
export class EditorOutput extends LitElement {
  static styles = styles;

  @property({ type: Array })
  blocks: Block[] = [];

  render() {
    return template(this);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "col-output": EditorOutput;
  }
}
