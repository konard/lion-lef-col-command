import { describe, it, expect, vi } from 'vitest';
import { generateId, sanitizeHTML, debounce, throttle, fuzzyMatch } from '../editor-component/utils/dom-helpers.js';

describe('generateId', () => {
  it('should return a string starting with "block-"', () => {
    const id = generateId();
    expect(id).toMatch(/^block-\d+-[a-z0-9]+$/);
  });

  it('should return unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe('sanitizeHTML', () => {
  it('should escape HTML entities', () => {
    expect(sanitizeHTML('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert("xss")&lt;/script&gt;',
    );
  });

  it('should handle plain text', () => {
    expect(sanitizeHTML('hello world')).toBe('hello world');
  });

  it('should escape ampersands', () => {
    expect(sanitizeHTML('a & b')).toBe('a &amp; b');
  });
});

describe('debounce', () => {
  it('should delay function execution', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(60);
    expect(fn).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });

  it('should reset timer on repeated calls', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 100);

    debounced();
    vi.advanceTimersByTime(80);
    debounced();
    vi.advanceTimersByTime(80);
    expect(fn).not.toHaveBeenCalled();

    vi.advanceTimersByTime(30);
    expect(fn).toHaveBeenCalledOnce();

    vi.useRealTimers();
  });
});

describe('throttle', () => {
  it('should call immediately on first call', () => {
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should prevent calls within the throttle window', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled();
    throttled();
    throttled();
    expect(fn).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(110);
    throttled();
    expect(fn).toHaveBeenCalledTimes(2);

    vi.useRealTimers();
  });
});

describe('fuzzyMatch', () => {
  it('should match exact prefix', () => {
    const { score, matched } = fuzzyMatch('hel', 'hello');
    expect(score).toBeGreaterThan(0);
    expect(matched).toEqual([0, 1, 2]);
  });

  it('should return 0 score for no match', () => {
    const { score, matched } = fuzzyMatch('xyz', 'hello');
    expect(score).toBe(0);
    expect(matched).toEqual([]);
  });

  it('should match non-contiguous characters', () => {
    const { score, matched } = fuzzyMatch('hlo', 'hello');
    expect(score).toBeGreaterThan(0);
    expect(matched.length).toBe(3);
  });

  it('should be case-insensitive', () => {
    const { score } = fuzzyMatch('HEL', 'hello');
    expect(score).toBeGreaterThan(0);
  });

  it('should give higher score for word boundary matches', () => {
    const { score: score1 } = fuzzyMatch('fb', 'foo-bar');
    const { score: score2 } = fuzzyMatch('fb', 'foobar');
    expect(score1).toBeGreaterThan(score2);
  });
});
