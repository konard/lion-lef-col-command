# Comprehensive Prompt for Lit Web Component Text Editor Implementation

You are tasked with creating a sophisticated text editor web component using Lit framework. This editor should have advanced AI integration capabilities and modern editing features. Follow the specifications below carefully:

## Main Requirements

### 1. AI Integration Support
- Implement integration with Mastra client or AI providers for various models
- Support different AI model outputs (streaming, completion, etc.)
- Create a flexible API for connecting different AI services
- Handle loading states, errors, and streaming responses appropriately
- Provide fallback mechanisms when AI services are unavailable
- Implement rate limiting and proper error handling for API calls

### 2. Intelligent Word Completion (Zed-like)
- Implement a contextual word completion feature similar to Zed editor
- Use anchor positioning to display a native popover menu during typing
- Show word suggestions based on context and learned patterns
- Position the popover relative to cursor position using proper coordinates
- Implement keyboard navigation for suggestion selection
- Support fuzzy matching algorithms for better suggestions
- Allow customization of trigger characters and delay timing

### 3. Command System via "/"
- Create a command palette accessible by typing "/"
- Support both HTML elements and custom web components as commands
- Design an API for registering custom commands with properties and configuration
- Allow disabling certain HTML elements if needed
- Provide a registry system for command definitions
- Include search and categorization features for commands
- Support keyboard shortcuts for common commands

### 4. Customizable Inline Tools
- Implement a popover API for inline text tools
- Show tools when text is selected (copy, paste, AI assistance, etc.)
- Design an extensible API for adding new inline tools
- Support contextual actions based on selected text content
- Include AI-powered text transformation options
- Enable rich formatting options (bold, italic, links, etc.)
- Support embedding of media and other content types

### 5. Dynamic Height Expansion
- Implement Shift+Enter functionality to expand the editor height
- Ensure smooth transitions and proper layout adjustments
- Maintain proper scrolling behavior when expanded
- Provide maximum height limits and scrollable overflow
- Support responsive design for different screen sizes

### 6. Block Reordering & Component Nesting
- Add drag-and-drop functionality for reordering content blocks
- Support nesting of editor components within themselves
- Enable component-based design capabilities
- Implement proper event handling for nested components
- Include visual indicators for drop zones and nesting levels
- Support undo/redo functionality for block operations

## Technical Specifications

The component should be organized in a modular folder structure:
```
editor-component/
├── advanced-text-editor/
│   ├── advanced-text-editor.ts
│   ├── advanced-text-editor.css.ts
│   └── advanced-text-editor.html.ts
├── ai-integration/
│   ├── ai-integration.ts
│   ├── ai-integration.css.ts
│   └── ai-integration.html.ts
├── completion-menu/
│   ├── completion-menu.ts
│   ├── completion-menu.css.ts
│   └── completion-menu.html.ts
├── command-palette/
│   ├── command-palette.ts
│   ├── command-palette.css.ts
│   └── command-palette.html.ts
├── inline-tools/
│   ├── inline-tools.ts
│   ├── inline-tools.css.ts
│   └── inline-tools.html.ts
├── block-manager/
│   ├── block-manager.ts
│   ├── block-manager.css.ts
│   └── block-manager.html.ts
├── utils/
│   ├── positioning.ts
│   ├── dom-helpers.ts
│   ├── ai-provider.ts
│   ├── event-emitter.ts
│   └── storage.ts
├── types/
│   ├── editor-types.ts
│   ├── ai-types.ts
│   └── command-types.ts
└── controllers/
    ├── ai-controller.ts
    ├── completion-controller.ts
    └── drag-drop-controller.ts
```

Each component should be split into three separate files:
- `[name].ts` - Contains the Lit element class with properties, methods, and business logic
- `[name].css.ts` - Contains only the CSS template literal with styles
- `[name].html.ts` - Contains only the HTML template literal with markup

Example structure:
```typescript
// advanced-text-editor.ts
import { LitElement, html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styles } from './advanced-text-editor.css.js';
import { template } from './advanced-text-editor.html.js';

@customElement('advanced-text-editor')
export class AdvancedTextEditor extends LitElement {
  static styles = styles;
  
  render() {
    return template(this);
  }
}
```

```typescript
// advanced-text-editor.css.ts
import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    /* Component styles */
  }
`;
```

```typescript
// advanced-text-editor.html.ts
import { html, TemplateResult } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { AdvancedTextEditor } from './advanced-text-editor.js';

export const template = (host: AdvancedTextEditor): TemplateResult => html`
  <div class="editor-container">
    <!-- Template content -->
  </div>
`;
```

## Additional Implementation Guidelines

1. **Architecture**: Organize code in a modular folder structure with separate files for logic, styles, and templates
2. **Performance**: Optimize for large documents and frequent updates using virtualization where appropriate
3. **Accessibility**: Ensure proper ARIA labels, keyboard navigation, and screen reader compatibility
4. **Styling**: Use CSS custom properties for theming flexibility and dark mode support
5. **Event Handling**: Properly propagate events between nested components with proper bubbling
6. **State Management**: Use Lit's reactive controllers for complex state and external data synchronization
7. **No Comments**: Exclude implementation comments from source files - use separate documentation if needed
8. **Module Naming**: Follow consistent naming convention with kebab-case for file names and PascalCase for class names
9. **Type Safety**: Implement comprehensive TypeScript interfaces and types for all APIs
10. **Testing**: Include unit tests and integration tests for all major functionality
11. **Documentation**: Provide JSDoc comments for public APIs and methods

## Data Models & Interfaces

Define comprehensive TypeScript interfaces for:
- Editor state management
- AI provider configurations
- Command definitions and registries
- Block content structures
- User preferences and settings
- Event payloads and responses

## Security Considerations

- Sanitize all user inputs and content to prevent XSS attacks
- Validate AI responses before rendering in the editor
- Implement proper CORS policies for API integrations
- Secure sensitive API keys and tokens
- Prevent injection of malicious content through commands

## Performance Optimizations

- Implement virtual scrolling for large documents
- Debounce or throttle expensive operations
- Optimize rendering with proper use of Lit's reactive properties
- Use efficient algorithms for text processing and suggestions
- Implement caching for AI responses and frequently accessed data

## Deliverables Expected

- Complete Lit component with all specified features
- TypeScript interfaces for API contracts
- Documentation for the public API
- Example usage patterns
- Unit tests and integration tests
- Build configuration files
- Consideration of edge cases and error handling
- Performance benchmarks and optimization report

## Final Requirements

Additionally, create a complete working example demonstrating all features and deploy it to GitHub Pages. The example should showcase:
- All core editor functionalities working together
- AI integration in action
- Word completion suggestions
- Command palette usage
- Inline tools during text selection
- Block reordering capabilities
- Nested component functionality

Provide clear deployment instructions for GitHub Pages including:
- Necessary build configurations (Vite, Rollup, or Webpack)
- GitHub Actions workflow for automated deployment
- Asset optimization strategies
- Performance monitoring setup

Include a comprehensive README with:
- Setup instructions
- Architecture overview
- API documentation
- Contribution guidelines
- Known limitations and future enhancements

Focus on creating a robust, well-structured solution that follows Lit framework best practices while implementing all the requested advanced features. Pay special attention to the AI integration points and the innovative block reordering/nesting capabilities.