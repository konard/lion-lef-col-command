export interface EditorState {
  blocks: Block[];
  selectedBlockId: string | null;
  cursorPosition: CursorPosition | null;
  selectionRange: SelectionRange | null;
  isComposing: boolean;
  isDragging: boolean;
}

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  children?: Block[];
  metadata?: Record<string, unknown>;
}

export type BlockType =
  | 'paragraph'
  | 'heading'
  | 'code'
  | 'list'
  | 'quote'
  | 'image'
  | 'divider'
  | 'custom';

export interface CursorPosition {
  blockId: string;
  offset: number;
  x: number;
  y: number;
}

export interface SelectionRange {
  startBlockId: string;
  startOffset: number;
  endBlockId: string;
  endOffset: number;
  text: string;
}

export interface EditorConfig {
  placeholder?: string;
  maxHeight?: number;
  minHeight?: number;
  readOnly?: boolean;
  spellcheck?: boolean;
  aiEnabled?: boolean;
  completionEnabled?: boolean;
  commandsEnabled?: boolean;
  inlineToolsEnabled?: boolean;
  blockReorderEnabled?: boolean;
}

export interface EditorChangeEvent {
  blocks: Block[];
  changedBlockId: string;
  type: 'insert' | 'update' | 'delete' | 'reorder';
}

export interface EditorSelectionEvent {
  selection: SelectionRange | null;
  position: { x: number; y: number };
}
