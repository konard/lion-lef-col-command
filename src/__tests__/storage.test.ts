import { describe, it, expect, beforeEach } from 'vitest';
import { saveToStorage, loadFromStorage, removeFromStorage } from '../editor-component/utils/storage.js';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load values', () => {
    saveToStorage('test-key', { a: 1, b: 'hello' });
    const result = loadFromStorage('test-key', null);
    expect(result).toEqual({ a: 1, b: 'hello' });
  });

  it('should return fallback when key not found', () => {
    const result = loadFromStorage('missing', 'default');
    expect(result).toBe('default');
  });

  it('should remove values', () => {
    saveToStorage('test-key', 'value');
    removeFromStorage('test-key');
    const result = loadFromStorage('test-key', 'fallback');
    expect(result).toBe('fallback');
  });

  it('should handle array values', () => {
    saveToStorage('arr', [1, 2, 3]);
    const result = loadFromStorage<number[]>('arr', []);
    expect(result).toEqual([1, 2, 3]);
  });

  it('should handle null values', () => {
    saveToStorage('null-val', null);
    const result = loadFromStorage('null-val', 'fallback');
    expect(result).toBeNull();
  });
});
