import { ReactiveController, ReactiveControllerHost } from "lit";
import type { AICompletionSuggestion } from "../types/ai-types.js";
import { loadFromStorage, saveToStorage } from "../utils/storage.js";
import { fuzzyMatch } from "../utils/dom-helpers.js";

const LEARNED_WORDS_KEY = "learned-words";

export class CompletionController implements ReactiveController {
  host: ReactiveControllerHost;
  suggestions: AICompletionSuggestion[] = [];
  isActive = false;
  selectedIndex = 0;

  private learnedWords: Map<string, number> = new Map();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private triggerDelay = 300;

  constructor(host: ReactiveControllerHost) {
    this.host = host;
    host.addController(this);
  }

  hostConnected(): void {
    const stored = loadFromStorage<[string, number][]>(LEARNED_WORDS_KEY, []);
    this.learnedWords = new Map(stored);
  }

  hostDisconnected(): void {
    this.dismiss();
  }

  learnWord(word: string): void {
    if (word.length < 2) return;
    const count = this.learnedWords.get(word) ?? 0;
    this.learnedWords.set(word, count + 1);
    saveToStorage(LEARNED_WORDS_KEY, Array.from(this.learnedWords.entries()));
  }

  learnFromText(text: string): void {
    const words = text.split(/\s+/).filter((w) => w.length >= 3);
    for (const word of words) {
      this.learnWord(word.replace(/[^\w]/g, ""));
    }
  }

  requestSuggestions(query: string): void {
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    if (query.length < 2) {
      this.dismiss();
      return;
    }

    this.debounceTimer = setTimeout(() => {
      this.computeSuggestions(query);
    }, this.triggerDelay);
  }

  private computeSuggestions(query: string): void {
    const results: AICompletionSuggestion[] = [];

    for (const [word, freq] of this.learnedWords) {
      const { score } = fuzzyMatch(query, word);
      if (score > 0) {
        results.push({
          text: word,
          score: score + freq * 0.5,
          source: "local",
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    this.suggestions = results.slice(0, 8);
    this.isActive = this.suggestions.length > 0;
    this.selectedIndex = 0;
    this.host.requestUpdate();
  }

  selectNext(): void {
    if (!this.isActive) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.suggestions.length;
    this.host.requestUpdate();
  }

  selectPrevious(): void {
    if (!this.isActive) return;
    this.selectedIndex =
      (this.selectedIndex - 1 + this.suggestions.length) % this.suggestions.length;
    this.host.requestUpdate();
  }

  getSelected(): AICompletionSuggestion | null {
    if (!this.isActive || this.suggestions.length === 0) return null;
    return this.suggestions[this.selectedIndex];
  }

  dismiss(): void {
    this.isActive = false;
    this.suggestions = [];
    this.selectedIndex = 0;
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.host.requestUpdate();
  }
}
