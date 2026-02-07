import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .block-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .block-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 4px;
    border-radius: 4px;
    position: relative;
    transition: background 0.15s;
  }

  .block-wrapper:hover .drag-handle {
    opacity: 1;
  }

  .block-wrapper.drag-over-above {
    border-top: 2px solid var(--editor-accent, #1a73e8);
  }

  .block-wrapper.drag-over-below {
    border-bottom: 2px solid var(--editor-accent, #1a73e8);
  }

  .block-wrapper.dragging {
    opacity: 0.4;
  }

  .drag-handle {
    opacity: 0.4;
    cursor: grab;
    padding: 4px 2px;
    color: var(--editor-muted, #999999);
    font-size: 14px;
    user-select: none;
    transition: opacity 0.15s;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  textarea.block-content {
    flex: 1;
    min-height: 28px;
    outline: none;
    padding: 4px 8px;
    border: none;
    border-radius: 4px;
    line-height: 1.6;
    resize: none;
    overflow: hidden;
    font-family: inherit;
    font-size: inherit;
    color: inherit;
    background: transparent;
    box-sizing: border-box;
    width: 100%;
  }

  textarea.block-content:focus {
    background: var(--editor-focus-bg, rgba(0, 0, 0, 0.02));
  }

  textarea.block-content::placeholder {
    color: var(--editor-placeholder, #aaaaaa);
  }

  textarea.block-content[data-type="heading"] {
    font-size: 1.5em;
    font-weight: 700;
  }

  textarea.block-content[data-type="code"] {
    font-family: "SF Mono", "Fira Code", monospace;
    font-size: 13px;
    background: var(--editor-code-bg, #f5f5f5);
    padding: 8px 12px;
    border-radius: 6px;
  }

  textarea.block-content[data-type="quote"] {
    border-left: 3px solid var(--editor-accent, #1a73e8);
    padding-left: 16px;
    color: var(--editor-muted, #666666);
    font-style: italic;
  }

  .block-divider {
    width: 100%;
    border: none;
    border-top: 1px solid var(--editor-border, #e0e0e0);
    margin: 8px 0;
  }

  .add-block-btn {
    background: transparent;
    border: 1px dashed var(--editor-border, #e0e0e0);
    border-radius: 4px;
    padding: 8px;
    width: 100%;
    cursor: pointer;
    color: var(--editor-muted, #999999);
    font-size: 13px;
    transition: all 0.15s;
  }

  .add-block-btn:hover {
    border-color: var(--editor-accent, #1a73e8);
    color: var(--editor-accent, #1a73e8);
  }

  @media (prefers-color-scheme: dark) {
    textarea.block-content:focus {
      background: var(--editor-focus-bg, rgba(255, 255, 255, 0.03));
    }

    textarea.block-content[data-type="code"] {
      background: var(--editor-code-bg, #1e1e2e);
    }
  }
`;
