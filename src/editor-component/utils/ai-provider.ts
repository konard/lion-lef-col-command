import type { AIProvider, AIProviderConfig, AIRequest, AIResponse, AIStreamChunk } from '../types/ai-types.js';

export class FetchAIProvider implements AIProvider {
  name: string;
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.name = config.name;
    this.config = config;
  }

  isAvailable(): boolean {
    return !!this.config.baseUrl && !!this.config.apiKey;
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    if (!this.isAvailable()) {
      throw new Error(`AI provider "${this.name}" is not configured`);
    }

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model ?? 'gpt-3.5-turbo',
        messages: [
          ...(request.systemPrompt
            ? [{ role: 'system', content: request.systemPrompt }]
            : []),
          ...(request.context
            ? [{ role: 'user', content: request.context }]
            : []),
          { role: 'user', content: request.prompt },
        ],
        max_tokens: this.config.maxTokens ?? 1024,
        temperature: this.config.temperature ?? 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.choices?.[0]?.message?.content ?? '',
      usage: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens,
            totalTokens: data.usage.total_tokens,
          }
        : undefined,
      model: data.model,
    };
  }

  async *stream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    if (!this.isAvailable()) {
      throw new Error(`AI provider "${this.name}" is not configured`);
    }

    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model ?? 'gpt-3.5-turbo',
        messages: [
          ...(request.systemPrompt
            ? [{ role: 'system', content: request.systemPrompt }]
            : []),
          { role: 'user', content: request.prompt },
        ],
        max_tokens: this.config.maxTokens ?? 1024,
        temperature: this.config.temperature ?? 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI stream request failed: ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        yield { text: '', done: true };
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            yield { text: '', done: true };
            return;
          }
          try {
            const parsed = JSON.parse(data);
            const text = parsed.choices?.[0]?.delta?.content ?? '';
            if (text) {
              yield { text, done: false };
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }
    }
  }
}

export class MockAIProvider implements AIProvider {
  name = 'mock';

  isAvailable(): boolean {
    return true;
  }

  async complete(request: AIRequest): Promise<AIResponse> {
    await new Promise((r) => setTimeout(r, 500));
    return {
      text: `AI response to: "${request.prompt.substring(0, 50)}..."`,
      model: 'mock',
    };
  }

  async *stream(request: AIRequest): AsyncGenerator<AIStreamChunk> {
    const words = `AI response to: "${request.prompt.substring(0, 30)}..."`.split(' ');
    for (const word of words) {
      await new Promise((r) => setTimeout(r, 100));
      yield { text: word + ' ', done: false };
    }
    yield { text: '', done: true };
  }
}
