import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--editor-text, #333333);
    --editor-accent: #1a73e8;
    --editor-border: #e0e0e0;
    --editor-bg: #ffffff;
    --editor-text: #333333;
    --editor-muted: #999999;
    --editor-placeholder: #aaaaaa;
  }

  .editor-root {
    border: 1px solid var(--editor-border);
    border-radius: 8px;
    background: var(--editor-bg);
    overflow: hidden;
    transition: border-color 0.15s;
  }

  .editor-root:focus-within {
    border-color: var(--editor-accent);
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.15);
  }

  .editor-body {
    padding: 16px;
    min-height: var(--editor-min-height, 120px);
    max-height: var(--editor-max-height, 600px);
    overflow-y: auto;
    transition: min-height 0.2s ease;
  }

  .editor-body.expanded {
    min-height: var(--editor-expanded-height, 300px);
  }

  .editor-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    border-top: 1px solid var(--editor-border);
    background: var(--editor-footer-bg, #fafafa);
    font-size: 12px;
    color: var(--editor-muted);
  }

  .editor-footer-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .editor-footer-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .footer-hint {
    opacity: 0.7;
  }

  .ai-toggle-btn {
    background: transparent;
    border: 1px solid var(--editor-border);
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
    color: var(--editor-text);
    transition: all 0.15s;
  }

  .ai-toggle-btn:hover {
    background: var(--editor-highlight, #e8f0fe);
  }

  .ai-toggle-btn.active {
    background: var(--editor-accent);
    color: #ffffff;
    border-color: var(--editor-accent);
  }

  @media (prefers-color-scheme: dark) {
    :host {
      --editor-bg: #1e1e2e;
      --editor-text: #e0e0e0;
      --editor-border: #444444;
      --editor-muted: #888888;
      --editor-placeholder: #666666;
    }

    .editor-footer {
      background: var(--editor-footer-bg, #252530);
    }
  }
`;
