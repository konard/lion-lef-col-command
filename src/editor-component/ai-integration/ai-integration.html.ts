import { html, TemplateResult, nothing } from "lit";
import type { AIIntegration } from "./ai-integration.js";

export const template = (host: AIIntegration): TemplateResult => html`
  <div class="ai-panel">
    <div class="ai-header">
      <span class="ai-title">AI Assistant</span>
      <div class="ai-header-right">
        <button
          class="ai-config-btn"
          @click="${host.toggleConfig}"
          aria-label="Configure model"
        >
          ${host.modelConfig.model}
        </button>
        <span class="ai-status" data-status="${host.aiController.status}">
          ${
            host.aiController.status === "idle"
              ? "Not configured"
              : host.aiController.status === "ready"
                ? "Ready"
                : host.aiController.status === "loading"
                  ? "Thinking..."
                  : host.aiController.status === "streaming"
                    ? "Generating..."
                    : host.aiController.status === "error"
                      ? "Error"
                      : ""
          }
        </span>
      </div>
    </div>

    ${
      host.showConfig
        ? html`
          <div class="ai-config-panel" popover="manual">
            <div class="config-field">
              <label class="config-label">Model</label>
              <input
                class="config-input"
                type="text"
                .value="${host.modelConfig.model}"
                @input="${(e: InputEvent) => host.updateModelConfig("model", (e.target as HTMLInputElement).value)}"
              />
            </div>
            <div class="config-field">
              <label class="config-label">Temperature</label>
              <input
                class="config-input"
                type="number"
                min="0"
                max="2"
                step="0.1"
                .value="${String(host.modelConfig.temperature)}"
                @input="${(e: InputEvent) => host.updateModelConfig("temperature", parseFloat((e.target as HTMLInputElement).value) || 0)}"
              />
            </div>
            <div class="config-field">
              <label class="config-label">Max Tokens</label>
              <input
                class="config-input"
                type="number"
                min="1"
                max="32000"
                step="256"
                .value="${String(host.modelConfig.maxTokens)}"
                @input="${(e: InputEvent) => host.updateModelConfig("maxTokens", parseInt((e.target as HTMLInputElement).value) || 1024)}"
              />
            </div>
          </div>
        `
        : nothing
    }

    <div class="ai-input-row">
      <input
        class="ai-input"
        type="text"
        placeholder="Ask AI to help with your text... (or type @model-name query)"
        .value="${host.prompt}"
        @input="${(e: InputEvent) => (host.prompt = (e.target as HTMLInputElement).value)}"
        @keydown="${(e: KeyboardEvent) => {
          if (e.key === "Enter") host.sendPrompt();
        }}"
        ?disabled="${host.aiController.status === "loading" || host.aiController.status === "streaming"}"
        aria-label="AI prompt"
      />
      <button
        class="ai-send-btn"
        @click="${host.sendPrompt}"
        ?disabled="${!host.prompt.trim() || host.aiController.status === "loading" || host.aiController.status === "streaming"}"
      >
        ${host.aiController.status === "streaming" ? "Stop" : "Send"}
      </button>
    </div>

    ${
      host.response
        ? html`
          <div class="ai-response">${host.response}</div>
          <div class="ai-actions">
            <button class="ai-action-btn" @click="${host.insertResponse}">
              Insert into editor
            </button>
            <button class="ai-action-btn" @click="${host.copyResponse}">Copy</button>
            <button class="ai-action-btn" @click="${host.clearResponse}">Dismiss</button>
          </div>
        `
        : nothing
    }
    ${
      host.aiController.error
        ? html`<div class="ai-error">${host.aiController.error}</div>`
        : nothing
    }
  </div>
`;
