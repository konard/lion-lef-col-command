export interface AIProviderConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface AIRequest {
  prompt: string;
  context?: string;
  systemPrompt?: string;
  stream?: boolean;
}

export interface AIResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
}

export interface AIStreamChunk {
  text: string;
  done: boolean;
}

export type AIProviderStatus = 'idle' | 'loading' | 'streaming' | 'error' | 'ready';

export interface AICompletionSuggestion {
  text: string;
  score: number;
  source: 'local' | 'ai';
}

export interface AITransformAction {
  label: string;
  prompt: string;
  icon?: string;
}

export interface AIProvider {
  name: string;
  complete(request: AIRequest): Promise<AIResponse>;
  stream(request: AIRequest): AsyncGenerator<AIStreamChunk>;
  isAvailable(): boolean;
}
