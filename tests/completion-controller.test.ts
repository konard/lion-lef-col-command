import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CompletionController } from '../src/editor-component/controllers/completion-controller.js';
import type { ReactiveControllerHost } from 'lit';

function createMockHost(): ReactiveControllerHost {
  return {
    addController: vi.fn(),
    removeController: vi.fn(),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
  };
}

describe('CompletionController', () => {
  let controller: CompletionController;
  let host: ReactiveControllerHost;

  beforeEach(() => {
    localStorage.clear();
    host = createMockHost();
    controller = new CompletionController(host);
    controller.hostConnected();
  });

  it('should register itself with the host', () => {
    expect(host.addController).toHaveBeenCalledWith(controller);
  });

  it('should start with no suggestions and inactive', () => {
    expect(controller.isActive).toBe(false);
    expect(controller.suggestions).toEqual([]);
    expect(controller.selectedIndex).toBe(0);
  });

  it('should learn words and provide suggestions', () => {
    vi.useFakeTimers();
    controller.learnWord('javascript');
    controller.learnWord('typescript');
    controller.learnWord('java');

    controller.requestSuggestions('java');
    vi.advanceTimersByTime(400);

    expect(controller.isActive).toBe(true);
    expect(controller.suggestions.length).toBeGreaterThan(0);
    expect(controller.suggestions.some((s) => s.text === 'javascript')).toBe(true);
    vi.useRealTimers();
  });

  it('should dismiss on short queries', () => {
    controller.learnWord('hello');
    controller.requestSuggestions('h');
    expect(controller.isActive).toBe(false);
  });

  it('should learn words from text', () => {
    vi.useFakeTimers();
    controller.learnFromText('hello world programming');
    controller.requestSuggestions('pro');
    vi.advanceTimersByTime(400);

    expect(controller.isActive).toBe(true);
    expect(controller.suggestions.some((s) => s.text === 'programming')).toBe(true);
    vi.useRealTimers();
  });

  it('should not learn words shorter than 2 characters', () => {
    vi.useFakeTimers();
    controller.learnWord('a');
    controller.requestSuggestions('a');
    vi.advanceTimersByTime(400);
    expect(controller.isActive).toBe(false);
    vi.useRealTimers();
  });

  it('should navigate suggestions with selectNext/selectPrevious', () => {
    vi.useFakeTimers();
    controller.learnWord('apple');
    controller.learnWord('application');
    controller.learnWord('apply');

    controller.requestSuggestions('app');
    vi.advanceTimersByTime(400);

    expect(controller.selectedIndex).toBe(0);
    controller.selectNext();
    expect(controller.selectedIndex).toBe(1);
    controller.selectPrevious();
    expect(controller.selectedIndex).toBe(0);
    vi.useRealTimers();
  });

  it('should wrap around when navigating past end', () => {
    vi.useFakeTimers();
    controller.learnWord('apple');
    controller.learnWord('application');

    controller.requestSuggestions('app');
    vi.advanceTimersByTime(400);

    const count = controller.suggestions.length;
    for (let i = 0; i < count; i++) {
      controller.selectNext();
    }
    expect(controller.selectedIndex).toBe(0);
    vi.useRealTimers();
  });

  it('should get selected suggestion', () => {
    vi.useFakeTimers();
    controller.learnWord('hello');

    controller.requestSuggestions('hel');
    vi.advanceTimersByTime(400);

    const selected = controller.getSelected();
    expect(selected).not.toBeNull();
    expect(selected?.text).toBe('hello');
    vi.useRealTimers();
  });

  it('should return null when no suggestions active', () => {
    expect(controller.getSelected()).toBeNull();
  });

  it('should dismiss and clear state', () => {
    vi.useFakeTimers();
    controller.learnWord('hello');
    controller.requestSuggestions('hel');
    vi.advanceTimersByTime(400);

    controller.dismiss();
    expect(controller.isActive).toBe(false);
    expect(controller.suggestions).toEqual([]);
    expect(controller.selectedIndex).toBe(0);
    vi.useRealTimers();
  });

  it('should persist learned words to localStorage', () => {
    controller.learnWord('persist');

    const host2 = createMockHost();
    const controller2 = new CompletionController(host2);
    controller2.hostConnected();

    vi.useFakeTimers();
    controller2.requestSuggestions('per');
    vi.advanceTimersByTime(400);

    expect(controller2.suggestions.some((s) => s.text === 'persist')).toBe(true);
    vi.useRealTimers();
  });
});
