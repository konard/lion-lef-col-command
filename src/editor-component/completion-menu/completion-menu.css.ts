import { css } from 'lit';

export const styles = css`
  :host {
    position: fixed;
    z-index: 1000;
    display: none;
  }

  :host([active]) {
    display: block;
  }

  .completion-menu {
    background: var(--editor-menu-bg, #ffffff);
    border: 1px solid var(--editor-border, #e0e0e0);
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    max-height: 200px;
    overflow-y: auto;
    min-width: 180px;
    padding: 4px;
  }

  .completion-item {
    padding: 6px 12px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
    color: var(--editor-text, #333333);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .completion-item:hover,
  .completion-item[aria-selected="true"] {
    background: var(--editor-highlight, #e8f0fe);
    color: var(--editor-highlight-text, #1a73e8);
  }

  .completion-source {
    font-size: 11px;
    color: var(--editor-muted, #999999);
    margin-left: auto;
  }

  @media (prefers-color-scheme: dark) {
    .completion-menu {
      background: var(--editor-menu-bg, #2d2d2d);
      border-color: var(--editor-border, #444444);
    }

    .completion-item {
      color: var(--editor-text, #e0e0e0);
    }

    .completion-item:hover,
    .completion-item[aria-selected="true"] {
      background: var(--editor-highlight, #3a3a5c);
    }
  }
`;
