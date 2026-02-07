# Lit Editor

A sophisticated text editor web component built with the [Lit](https://lit.dev) framework. Features block-based editing, AI integration, intelligent word completion, command palette, inline formatting tools, and drag-and-drop block reordering.

## Features

- **Block-Based Editing** — Content is organized into blocks (paragraphs, headings, code, quotes, dividers) that can be individually edited and reordered
- **Intelligent Word Completion** — Learns from your typing and suggests words with fuzzy matching (Zed-like)
- **Command Palette** — Type `/` to access commands for changing block types, inserting dividers, and more
- **Inline Formatting Tools** — Select text to show a floating toolbar with bold, italic, underline, strikethrough, link, and copy options
- **AI Integration** — Configurable AI provider support with streaming responses, includes a mock provider for testing
- **Drag & Drop Reordering** — Reorder blocks by dragging their handle
- **Dynamic Height** — Shift+Enter toggles expanded editor height
- **Dark Mode** — Automatic dark mode via CSS custom properties
- **Accessible** — ARIA roles and labels throughout

## Setup

```bash
npm install
npm run dev
```

Open `http://localhost:5173` to see the demo.

## Build

```bash
npm run build    # TypeScript check + Vite production build
npm run preview  # Preview production build locally
```

## Test

```bash
npm test         # Run unit tests
npm run test:watch  # Run in watch mode
```

## Architecture

```
src/editor-component/
├── advanced-text-editor/   Main editor component (ties everything together)
├── ai-integration/         AI panel component
├── block-manager/          Block-based content management
├── command-palette/        / command system
├── completion-menu/        Word completion popover
├── inline-tools/           Text selection toolbar
├── controllers/            Reactive controllers (AI, completion, drag-drop)
├── types/                  TypeScript interfaces
└── utils/                  Shared utilities
```

Each component follows the three-file pattern:
- `[name].ts` — Lit element class with properties, methods, and logic
- `[name].css.ts` — CSS template literal
- `[name].html.ts` — HTML template literal

## API

### Basic Usage

```html
<advanced-text-editor
  placeholder="Start typing..."
  ai-enabled
  completion-enabled
  commands-enabled
  inline-tools-enabled
  block-reorder-enabled
></advanced-text-editor>
```

### JavaScript API

```js
const editor = document.querySelector('advanced-text-editor');

// Get/set content
editor.getContent();
editor.setContent('Hello\nWorld');

// AI provider
import { MockAIProvider } from './src/editor-component/utils/ai-provider.js';
editor.setAIProvider(new MockAIProvider());

// Custom commands
editor.registerCommand({
  id: 'my-cmd',
  label: 'My Command',
  description: 'Does something',
  execute: (ctx) => { /* ... */ }
});

// Custom inline tools
editor.addInlineTool({
  id: 'translate',
  label: 'Translate',
  icon: '🌐',
  action: (text) => { /* ... */ }
});
```

### Events

| Event | Detail | Description |
|-------|--------|-------------|
| `editor-change` | `{ blocks, changedBlockId, type }` | Fired on content changes |
| `ai-insert` | `{ text }` | AI response inserted into editor |
| `blocks-change` | `{ blocks, changedBlockId, type }` | Block-level changes |

### Theming

Override CSS custom properties on the `advanced-text-editor` element:

```css
advanced-text-editor {
  --editor-accent: #1a73e8;
  --editor-bg: #ffffff;
  --editor-text: #333333;
  --editor-border: #e0e0e0;
  --editor-muted: #999999;
  --editor-placeholder: #aaaaaa;
}
```

## Deployment

GitHub Pages deployment is automated via `.github/workflows/deploy.yml`. Push to `release` branch to trigger a build and deploy.

Manual deployment:

```bash
npm run build
# Upload contents of dist/ to your hosting provider
```

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch
3. Follow the three-file component pattern (`.ts`, `.css.ts`, `.html.ts`)
4. Write tests for new functionality
5. Run `npm test` and `npm run build` before submitting a PR

## Known Limitations

- AI integration requires an external API — use `MockAIProvider` for offline development
- Word completion uses local learning only (no external AI completion yet)
- Nested editor components (editor within editor) are supported structurally but not yet fully implemented
- `document.execCommand` is used for inline formatting (deprecated but widely supported)

## License

MIT
