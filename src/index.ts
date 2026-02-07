export { AdvancedTextEditor } from "./editor-component/advanced-text-editor/advanced-text-editor.js";
export { BlockManager } from "./editor-component/block-manager/block-manager.js";
export { CompletionMenu } from "./editor-component/completion-menu/completion-menu.js";
export { CommandPalette } from "./editor-component/command-palette/command-palette.js";
export { InlineTools } from "./editor-component/inline-tools/inline-tools.js";
export { AIIntegration } from "./editor-component/ai-integration/ai-integration.js";

export { AIController } from "./editor-component/controllers/ai-controller.js";
export { CompletionController } from "./editor-component/controllers/completion-controller.js";
export { DragDropController } from "./editor-component/controllers/drag-drop-controller.js";

export { FetchAIProvider, MockAIProvider } from "./editor-component/utils/ai-provider.js";
export { EventEmitter } from "./editor-component/utils/event-emitter.js";

export type {
  Block,
  BlockType,
  EditorState,
  EditorConfig,
  EditorChangeEvent,
  CursorPosition,
  SelectionRange,
} from "./editor-component/types/editor-types.js";
export type {
  AIProvider,
  AIProviderConfig,
  AIRequest,
  AIResponse,
  AIStreamChunk,
  AIProviderStatus,
  AICompletionSuggestion,
  AITransformAction,
} from "./editor-component/types/ai-types.js";
export type {
  CommandDefinition,
  CommandContext,
  CommandCategory,
  CommandPaletteConfig,
  CommandSearchResult,
} from "./editor-component/types/command-types.js";
