import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './advanced-text-editor.css.js';
import { template } from './advanced-text-editor.html.js';
import type { Block, EditorChangeEvent, BlockType } from '../types/editor-types.js';
import type { AIProvider, AICompletionSuggestion } from '../types/ai-types.js';
import type { CommandDefinition } from '../types/command-types.js';
import type { InlineTool } from '../inline-tools/inline-tools.js';
import { CompletionController } from '../controllers/completion-controller.js';
import { getCaretCoordinates, calculatePopoverPosition } from '../utils/positioning.js';
import { generateId } from '../utils/dom-helpers.js';

import '../block-manager/block-manager.js';
import '../completion-menu/completion-menu.js';
import '../command-palette/command-palette.js';
import '../inline-tools/inline-tools.js';
import '../ai-integration/ai-integration.js';

@customElement('advanced-text-editor')
export class AdvancedTextEditor extends LitElement {
  static styles = styles;

  @property({ type: String })
  placeholder = 'Start typing...';

  @property({ type: Boolean, attribute: 'ai-enabled' })
  aiEnabled = false;

  @property({ type: Boolean, attribute: 'completion-enabled' })
  completionEnabled = true;

  @property({ type: Boolean, attribute: 'commands-enabled' })
  commandsEnabled = true;

  @property({ type: Boolean, attribute: 'inline-tools-enabled' })
  inlineToolsEnabled = true;

  @property({ type: Boolean, attribute: 'block-reorder-enabled' })
  blockReorderEnabled = true;

  @property({ type: Boolean, attribute: 'read-only' })
  readOnly = false;

  @state()
  blocks: Block[] = [{ id: generateId(), type: 'paragraph', content: '' }];

  @state()
  expanded = false;

  @state()
  showAIPanel = false;

  @state()
  commandPaletteActive = false;

  @state()
  inlineToolsActive = false;

  @state()
  selectedText = '';

  @state()
  completionPosition = { top: 0, left: 0 };

  @state()
  commandPalettePosition = { top: 0, left: 0 };

  @state()
  inlineToolsPosition = { top: 0, left: 0 };

  customInlineTools: InlineTool[] = [];

  completionController = new CompletionController(this);

  private focusedBlockId: string | null = null;
  private selectionCheckTimer: ReturnType<typeof setTimeout> | null = null;

  render() {
    return template(this);
  }

  connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener('selectionchange', this.handleSelectionChange);
    if (this.commandsEnabled) {
      this.registerDefaultCommands();
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('selectionchange', this.handleSelectionChange);
    if (this.selectionCheckTimer) clearTimeout(this.selectionCheckTimer);
  }

  setAIProvider(provider: AIProvider): void {
    this.aiEnabled = true;
    this.updateComplete.then(() => {
      const aiPanel = this.shadowRoot?.querySelector('ai-integration');
      if (aiPanel) {
        (aiPanel as any).setProvider(provider);
      }
    });
  }

  registerCommand(command: CommandDefinition): void {
    this.updateComplete.then(() => {
      const palette = this.shadowRoot?.querySelector('command-palette');
      if (palette) {
        (palette as any).registerCommand(command);
      }
    });
  }

  registerCommands(commands: CommandDefinition[]): void {
    this.updateComplete.then(() => {
      const palette = this.shadowRoot?.querySelector('command-palette');
      if (palette) {
        (palette as any).registerCommands(commands);
      }
    });
  }

  addInlineTool(tool: InlineTool): void {
    this.customInlineTools = [...this.customInlineTools, tool];
  }

  getContent(): string {
    return this.blocks.map((b) => b.content).join('\n');
  }

  setContent(content: string): void {
    const lines = content.split('\n').filter((l) => l.trim());
    if (lines.length === 0) {
      this.blocks = [{ id: generateId(), type: 'paragraph', content: '' }];
    } else {
      this.blocks = lines.map((line) => ({
        id: generateId(),
        type: 'paragraph' as BlockType,
        content: line,
      }));
    }
  }

  getBlocks(): Block[] {
    return [...this.blocks];
  }

  handleBlocksChange(e: CustomEvent<EditorChangeEvent>): void {
    this.blocks = e.detail.blocks;

    if (this.completionEnabled) {
      const block = this.blocks.find((b) => b.id === e.detail.changedBlockId);
      if (block) {
        this.completionController.learnFromText(block.content);
        const lastWord = this.getLastWord(block.content);
        if (lastWord) {
          this.completionController.requestSuggestions(lastWord);
          this.updateCompletionPosition();
        } else {
          this.completionController.dismiss();
        }
      }
    }

    this.dispatchEvent(
      new CustomEvent('editor-change', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  handleBlockKeyDown(e: CustomEvent<{ blockId: string; event: KeyboardEvent }>): void {
    const { event: keyEvent } = e.detail;

    if (keyEvent.key === 'Enter' && keyEvent.shiftKey) {
      keyEvent.preventDefault();
      this.expanded = !this.expanded;
      return;
    }

    if (keyEvent.key === '/' && this.commandsEnabled) {
      this.openCommandPalette();
      return;
    }

    if (this.completionController.isActive) {
      if (keyEvent.key === 'ArrowDown') {
        keyEvent.preventDefault();
        this.completionController.selectNext();
        return;
      }
      if (keyEvent.key === 'ArrowUp') {
        keyEvent.preventDefault();
        this.completionController.selectPrevious();
        return;
      }
      if (keyEvent.key === 'Tab' || keyEvent.key === 'Enter') {
        const selected = this.completionController.getSelected();
        if (selected) {
          keyEvent.preventDefault();
          this.applyCompletion(selected);
          return;
        }
      }
      if (keyEvent.key === 'Escape') {
        this.completionController.dismiss();
        return;
      }
    }
  }

  handleBlockFocus(e: CustomEvent<{ blockId: string }>): void {
    this.focusedBlockId = e.detail.blockId;
  }

  handleBlockBlur(_e: CustomEvent<{ blockId: string }>): void {
    setTimeout(() => {
      this.completionController.dismiss();
    }, 200);
  }

  handleCompletionSelect(e: CustomEvent<AICompletionSuggestion>): void {
    this.applyCompletion(e.detail);
  }

  handlePaletteClose(): void {
    this.commandPaletteActive = false;
  }

  handleFormatApplied(_e: CustomEvent): void {
    this.inlineToolsActive = false;
  }

  handleAIInsert(e: CustomEvent<{ text: string }>): void {
    const blockManager = this.shadowRoot?.querySelector('block-manager') as any;
    if (blockManager) {
      const block = blockManager.addBlock();
      blockManager.updateBlockContent(block.id, e.detail.text);
    }
  }

  toggleAIPanel(): void {
    this.showAIPanel = !this.showAIPanel;
  }

  private handleSelectionChange = (): void => {
    if (!this.inlineToolsEnabled) return;

    if (this.selectionCheckTimer) clearTimeout(this.selectionCheckTimer);
    this.selectionCheckTimer = setTimeout(() => {
      const selection = window.getSelection();
      const text = selection?.toString().trim() ?? '';

      if (text.length > 0) {
        this.selectedText = text;
        const range = selection!.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const pos = calculatePopoverPosition(
          { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
          40,
          300,
        );
        this.inlineToolsPosition = { top: pos.top, left: pos.left };
        this.inlineToolsActive = true;
      } else {
        this.inlineToolsActive = false;
        this.selectedText = '';
      }
    }, 300);
  };

  private openCommandPalette(): void {
    const caret = this.getActiveCaretRect();
    if (caret) {
      const pos = calculatePopoverPosition(caret, 300, 260);
      this.commandPalettePosition = { top: pos.top, left: pos.left };
    }
    this.commandPaletteActive = true;

    this.updateComplete.then(() => {
      const palette = this.shadowRoot?.querySelector('command-palette') as any;
      palette?.open({
        editor: this,
        blockId: this.focusedBlockId ?? undefined,
      });
    });
  }

  private applyCompletion(suggestion: AICompletionSuggestion): void {
    if (!this.focusedBlockId) return;

    const blockManager = this.shadowRoot?.querySelector('block-manager') as any;
    const block = this.blocks.find((b) => b.id === this.focusedBlockId);
    if (!block || !blockManager) return;

    const lastWord = this.getLastWord(block.content);
    if (lastWord) {
      const newContent = block.content.slice(0, block.content.length - lastWord.length) + suggestion.text;
      blockManager.updateBlockContent(this.focusedBlockId, newContent);
    }

    this.completionController.learnWord(suggestion.text);
    this.completionController.dismiss();
  }

  private updateCompletionPosition(): void {
    const caret = this.getActiveCaretRect();
    if (caret) {
      const pos = calculatePopoverPosition(caret, 200, 180);
      this.completionPosition = { top: pos.top, left: pos.left };
    }
  }

  private getActiveCaretRect(): { x: number; y: number; width: number; height: number } | null {
    if (!this.focusedBlockId) return null;
    const blockEl = this.shadowRoot?.querySelector(
      `block-manager`,
    )?.shadowRoot?.querySelector(
      `[data-block-id="${this.focusedBlockId}"].block-content`,
    ) as HTMLElement | null;
    if (!blockEl) return null;
    return getCaretCoordinates(blockEl);
  }

  private getLastWord(text: string): string {
    const stripped = text.replace(/<[^>]*>/g, '');
    const match = stripped.match(/(\S+)$/);
    return match ? match[1] : '';
  }

  private registerDefaultCommands(): void {
    const commands: CommandDefinition[] = [
      {
        id: 'heading',
        label: 'Heading',
        description: 'Turn block into a heading',
        icon: 'H',
        category: 'basic',
        execute: (ctx) => {
          const blockManager = this.shadowRoot?.querySelector('block-manager') as any;
          if (blockManager && ctx.blockId) {
            blockManager.updateBlockType(ctx.blockId, 'heading');
          }
        },
      },
      {
        id: 'code',
        label: 'Code Block',
        description: 'Insert a code block',
        icon: '<>',
        category: 'basic',
        execute: (ctx) => {
          const blockManager = this.shadowRoot?.querySelector('block-manager') as any;
          if (blockManager && ctx.blockId) {
            blockManager.updateBlockType(ctx.blockId, 'code');
          }
        },
      },
      {
        id: 'quote',
        label: 'Quote',
        description: 'Turn block into a quote',
        icon: '"',
        category: 'basic',
        execute: (ctx) => {
          const blockManager = this.shadowRoot?.querySelector('block-manager') as any;
          if (blockManager && ctx.blockId) {
            blockManager.updateBlockType(ctx.blockId, 'quote');
          }
        },
      },
      {
        id: 'divider',
        label: 'Divider',
        description: 'Insert a horizontal divider',
        icon: '—',
        category: 'basic',
        execute: () => {
          const blockManager = this.shadowRoot?.querySelector('block-manager') as any;
          if (blockManager) {
            blockManager.addBlock('divider');
          }
        },
      },
      {
        id: 'paragraph',
        label: 'Paragraph',
        description: 'Turn block into a paragraph',
        icon: 'P',
        category: 'basic',
        execute: (ctx) => {
          const blockManager = this.shadowRoot?.querySelector('block-manager') as any;
          if (blockManager && ctx.blockId) {
            blockManager.updateBlockType(ctx.blockId, 'paragraph');
          }
        },
      },
    ];

    this.registerCommands(commands);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'advanced-text-editor': AdvancedTextEditor;
  }
}
