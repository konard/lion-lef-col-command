import { css } from "lit";

export const styles = css`
  :host {
    position: fixed;
    z-index: 1000;
    display: none;
  }

  :host([active]) {
    display: block;
  }

  .toolbar {
    background: var(--editor-toolbar-bg, #333333);
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    padding: 4px;
    gap: 2px;
  }

  .tool-btn {
    background: transparent;
    border: none;
    color: var(--editor-toolbar-text, #ffffff);
    cursor: pointer;
    padding: 6px 8px;
    border-radius: 4px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 28px;
    justify-content: center;
    transition: background 0.15s;
  }

  .tool-btn:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  .tool-btn:active {
    background: rgba(255, 255, 255, 0.25);
  }

  .tool-btn[aria-pressed="true"] {
    background: rgba(255, 255, 255, 0.2);
  }

  .separator {
    width: 1px;
    height: 20px;
    background: rgba(255, 255, 255, 0.2);
    margin: 0 2px;
  }

  @media (prefers-color-scheme: dark) {
    .toolbar {
      background: var(--editor-toolbar-bg, #1a1a2e);
    }
  }
`;
