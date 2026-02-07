export interface CommandDefinition {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  category?: string;
  shortcut?: string;
  disabled?: boolean;
  execute: (context: CommandContext) => void | Promise<void>;
}

export interface CommandContext {
  editor: HTMLElement;
  blockId?: string;
  cursorOffset?: number;
  selectedText?: string;
}

export interface CommandCategory {
  id: string;
  label: string;
  icon?: string;
  order?: number;
}

export interface CommandPaletteConfig {
  triggerChar: string;
  maxResults: number;
  debounceMs: number;
  categories: CommandCategory[];
}

export interface CommandSearchResult {
  command: CommandDefinition;
  matchScore: number;
  matchedChars: number[];
}
