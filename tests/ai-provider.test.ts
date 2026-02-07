import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '../src/editor-component/utils/ai-provider.js';

describe('MockAIProvider', () => {
  it('should always be available', () => {
    const provider = new MockAIProvider();
    expect(provider.isAvailable()).toBe(true);
  });

  it('should return a response', async () => {
    const provider = new MockAIProvider();
    const response = await provider.complete({ prompt: 'Hello world' });
    expect(response.text).toContain('AI response');
    expect(response.model).toBe('mock');
  });

  it('should stream response', async () => {
    const provider = new MockAIProvider();
    const chunks: string[] = [];

    for await (const chunk of provider.stream({ prompt: 'Hello' })) {
      chunks.push(chunk.text);
      if (chunk.done) break;
    }

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[chunks.length - 1]).toBe('');
  });

  it('should have name "mock"', () => {
    const provider = new MockAIProvider();
    expect(provider.name).toBe('mock');
  });
});
