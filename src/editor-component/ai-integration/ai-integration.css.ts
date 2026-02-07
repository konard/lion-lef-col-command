import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .ai-panel {
    border: 1px solid var(--editor-border, #e0e0e0);
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
    background: var(--editor-panel-bg, #fafafa);
  }

  .ai-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .ai-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ai-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--editor-text, #333333);
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .ai-config-btn {
    background: transparent;
    border: 1px solid var(--editor-border, #e0e0e0);
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    cursor: pointer;
    color: var(--editor-accent, #1a73e8);
    transition: all 0.15s;
  }

  .ai-config-btn:hover {
    background: var(--editor-highlight, #e8f0fe);
  }

  .ai-config-panel {
    margin-bottom: 8px;
    padding: 8px;
    border: 1px solid var(--editor-border, #e0e0e0);
    border-radius: 6px;
    background: var(--editor-bg, #ffffff);
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .config-field {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: 1;
    min-width: 100px;
  }

  .config-label {
    font-size: 11px;
    font-weight: 500;
    color: var(--editor-muted, #999999);
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .config-input {
    padding: 4px 8px;
    border: 1px solid var(--editor-border, #e0e0e0);
    border-radius: 4px;
    font-size: 12px;
    background: var(--editor-input-bg, #ffffff);
    color: var(--editor-text, #333333);
    outline: none;
  }

  .config-input:focus {
    border-color: var(--editor-accent, #1a73e8);
  }

  .ai-status {
    font-size: 12px;
    color: var(--editor-muted, #999999);
  }

  .ai-status[data-status="streaming"] {
    color: var(--editor-accent, #1a73e8);
  }

  .ai-status[data-status="error"] {
    color: var(--editor-error, #d93025);
  }

  .ai-input-row {
    display: flex;
    gap: 8px;
  }

  .ai-input {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid var(--editor-border, #e0e0e0);
    border-radius: 6px;
    font-size: 13px;
    background: var(--editor-input-bg, #ffffff);
    color: var(--editor-text, #333333);
    outline: none;
    transition: border-color 0.15s;
  }

  .ai-input:focus {
    border-color: var(--editor-accent, #1a73e8);
  }

  .ai-send-btn {
    padding: 8px 16px;
    background: var(--editor-accent, #1a73e8);
    color: #ffffff;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .ai-send-btn:hover {
    opacity: 0.9;
  }

  .ai-send-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .ai-response {
    margin-top: 8px;
    padding: 10px 12px;
    background: var(--editor-ai-response-bg, #e8f0fe);
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--editor-text, #333333);
    white-space: pre-wrap;
  }

  .ai-error {
    margin-top: 8px;
    padding: 8px 12px;
    background: var(--editor-error-bg, #fce8e6);
    border-radius: 6px;
    color: var(--editor-error, #d93025);
    font-size: 13px;
  }

  .ai-actions {
    display: flex;
    gap: 6px;
    margin-top: 8px;
  }

  .ai-action-btn {
    padding: 4px 10px;
    background: transparent;
    border: 1px solid var(--editor-border, #e0e0e0);
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    color: var(--editor-text, #333333);
    transition: all 0.15s;
  }

  .ai-action-btn:hover {
    background: var(--editor-highlight, #e8f0fe);
    border-color: var(--editor-accent, #1a73e8);
  }

  @media (prefers-color-scheme: dark) {
    .ai-panel {
      background: var(--editor-panel-bg, #252530);
    }

    .ai-input {
      background: var(--editor-input-bg, #2d2d3d);
      border-color: var(--editor-border, #444444);
    }

    .ai-config-panel {
      background: var(--editor-bg, #1e1e2e);
    }

    .config-input {
      background: var(--editor-input-bg, #2d2d3d);
      border-color: var(--editor-border, #444444);
    }

    .ai-response {
      background: var(--editor-ai-response-bg, #2a2a4a);
    }

    .ai-error {
      background: var(--editor-error-bg, #3a1a1a);
    }
  }
`;
