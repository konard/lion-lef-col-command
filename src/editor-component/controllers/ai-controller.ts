import { ReactiveController, ReactiveControllerHost } from "lit";
import type { AIProvider, AIProviderStatus, AIRequest, AIResponse } from "../types/ai-types.js";

export class AIController implements ReactiveController {
  host: ReactiveControllerHost;
  provider: AIProvider | null = null;
  status: AIProviderStatus = "idle";
  streamedText = "";
  error: string | null = null;

  private abortController: AbortController | null = null;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.status = this.provider?.isAvailable() ? "ready" : "idle";
  }

  hostDisconnected(): void {
    this.abort();
  }

  setProvider(provider: AIProvider): void {
    this.provider = provider;
    this.status = provider.isAvailable() ? "ready" : "idle";
    this.host.requestUpdate();
  }

  async complete(request: AIRequest): Promise<AIResponse | null> {
    if (!this.provider || !this.provider.isAvailable()) {
      this.error = "AI provider not available";
      this.host.requestUpdate();
      return null;
    }

    this.status = "loading";
    this.error = null;
    this.host.requestUpdate();

    try {
      const response = await this.provider.complete(request);
      this.status = "ready";
      this.host.requestUpdate();
      return response;
    } catch (err) {
      this.status = "error";
      this.error = err instanceof Error ? err.message : "Unknown error";
      this.host.requestUpdate();
      return null;
    }
  }

  async streamResponse(request: AIRequest, onChunk: (text: string) => void): Promise<string> {
    if (!this.provider || !this.provider.isAvailable()) {
      this.error = "AI provider not available";
      this.host.requestUpdate();
      return "";
    }

    this.status = "streaming";
    this.streamedText = "";
    this.error = null;
    this.abortController = new AbortController();
    this.host.requestUpdate();

    try {
      for await (const chunk of this.provider.stream(request)) {
        if (this.abortController?.signal.aborted) break;
        if (chunk.text) {
          this.streamedText += chunk.text;
          onChunk(chunk.text);
          this.host.requestUpdate();
        }
        if (chunk.done) break;
      }
      this.status = "ready";
      this.host.requestUpdate();
      return this.streamedText;
    } catch (err) {
      this.status = "error";
      this.error = err instanceof Error ? err.message : "Unknown error";
      this.host.requestUpdate();
      return this.streamedText;
    }
  }

  abort(): void {
    this.abortController?.abort();
    this.abortController = null;
    if (this.status === "streaming" || this.status === "loading") {
      this.status = "ready";
      this.host.requestUpdate();
    }
  }
}
