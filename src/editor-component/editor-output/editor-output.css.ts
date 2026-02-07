import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: var(--editor-text, #333333);
  }

  .output-root {
    padding: 16px;
  }

  .output-paragraph {
    margin: 0 0 8px;
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .output-heading {
    font-size: 1.5em;
    font-weight: 700;
    margin: 16px 0 8px;
  }

  .output-code {
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 13px;
    background: var(--editor-code-bg, #f5f5f5);
    padding: 12px 16px;
    border-radius: 6px;
    margin: 8px 0;
    overflow-x: auto;
    white-space: pre-wrap;
  }

  .output-quote {
    border-left: 3px solid var(--editor-accent, #1a73e8);
    padding-left: 16px;
    margin: 8px 0;
    color: var(--editor-muted, #666666);
    font-style: italic;
  }

  .output-divider {
    border: none;
    border-top: 1px solid var(--editor-border, #e0e0e0);
    margin: 12px 0;
  }

  .output-empty {
    color: var(--editor-muted, #999999);
    font-style: italic;
  }

  @media (prefers-color-scheme: dark) {
    .output-code {
      background: var(--editor-code-bg, #1e1e2e);
    }
  }
`;
