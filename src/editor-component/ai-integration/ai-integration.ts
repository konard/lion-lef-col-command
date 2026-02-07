import { LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styles } from "./ai-integration.css.js";
import { template } from "./ai-integration.html.js";
import { AIController } from "../controllers/ai-controller.js";
import type { AIProvider } from "../types/ai-types.js";

@customElement("ai-integration")
export class AIIntegration extends LitElement {
  static styles = styles;

  aiController = new AIController(this);

  @state()
  prompt = "";

  @state()
  response = "";

  @property({ type: String })
  context = "";

  render() {
    return template(this);
  }

  setProvider(provider: AIProvider): void {
    this.aiController.setProvider(provider);
  }

  async sendPrompt(): Promise<void> {
    if (!this.prompt.trim()) return;

    if (this.aiController.status === "streaming") {
      this.aiController.abort();
      return;
    }

    this.response = "";
    const result = await this.aiController.complete({
      prompt: this.prompt,
      context: this.context,
    });

    if (result) {
      this.response = result.text;
    }
  }

  async streamPrompt(): Promise<void> {
    if (!this.prompt.trim()) return;
    this.response = "";
    await this.aiController.streamResponse(
      { prompt: this.prompt, context: this.context, stream: true },
      (chunk) => {
        this.response += chunk;
      },
    );
  }

  insertResponse(): void {
    this.dispatchEvent(
      new CustomEvent("ai-insert", {
        detail: { text: this.response },
        bubbles: true,
        composed: true,
      }),
    );
    this.clearResponse();
  }

  copyResponse(): void {
    navigator.clipboard.writeText(this.response).catch(() => {});
  }

  clearResponse(): void {
    this.response = "";
    this.prompt = "";
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ai-integration": AIIntegration;
  }
}
