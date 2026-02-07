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

  .palette {
    background: var(--editor-menu-bg, #ffffff);
    border: 1px solid var(--editor-border, #e0e0e0);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    min-width: 240px;
    max-height: 300px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .palette-search {
    padding: 8px 12px;
    border-bottom: 1px solid var(--editor-border, #e0e0e0);
  }

  .palette-search input {
    width: 100%;
    border: none;
    outline: none;
    font-size: 14px;
    background: transparent;
    color: var(--editor-text, #333333);
    box-sizing: border-box;
  }

  .palette-list {
    overflow-y: auto;
    max-height: 260px;
    padding: 4px;
  }

  .palette-category {
    padding: 4px 12px 2px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--editor-muted, #999999);
    letter-spacing: 0.5px;
  }

  .palette-item {
    padding: 8px 12px;
    cursor: pointer;
    border-radius: 4px;
    font-size: 14px;
    color: var(--editor-text, #333333);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .palette-item:hover,
  .palette-item[aria-selected="true"] {
    background: var(--editor-highlight, #e8f0fe);
  }

  .palette-item-icon {
    font-size: 16px;
    width: 20px;
    text-align: center;
  }

  .palette-item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .palette-item-label {
    font-weight: 500;
  }

  .palette-item-desc {
    font-size: 12px;
    color: var(--editor-muted, #999999);
  }

  .palette-item-shortcut {
    font-size: 12px;
    color: var(--editor-muted, #999999);
    font-family: monospace;
  }

  .palette-empty {
    padding: 16px;
    text-align: center;
    color: var(--editor-muted, #999999);
    font-size: 13px;
  }

  @media (prefers-color-scheme: dark) {
    .palette {
      background: var(--editor-menu-bg, #2d2d2d);
      border-color: var(--editor-border, #444444);
    }

    .palette-search input {
      color: var(--editor-text, #e0e0e0);
    }

    .palette-item {
      color: var(--editor-text, #e0e0e0);
    }

    .palette-item:hover,
    .palette-item[aria-selected="true"] {
      background: var(--editor-highlight, #3a3a5c);
    }
  }
`;
