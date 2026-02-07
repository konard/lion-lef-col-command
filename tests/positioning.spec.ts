import { describe, it, expect, afterEach } from 'bun:test';
import { calculatePopoverPosition } from '../src/editor-component/utils/positioning.js';

describe('calculatePopoverPosition', () => {
  const originalInnerHeight = window.innerHeight;
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, 'innerHeight', { value: originalInnerHeight, writable: true, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: originalInnerWidth, writable: true, configurable: true });
  });

  it('should place below anchor by default', () => {
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    const result = calculatePopoverPosition(
      { x: 100, y: 100, width: 0, height: 20 },
      200,
      180,
    );
    expect(result.placement).toBe('below');
    expect(result.top).toBe(124);
    expect(result.left).toBe(100);
  });

  it('should place above when not enough space below', () => {
    Object.defineProperty(window, 'innerHeight', { value: 500, writable: true, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    const result = calculatePopoverPosition(
      { x: 100, y: 400, width: 0, height: 20 },
      200,
      180,
    );
    expect(result.placement).toBe('above');
    expect(result.top).toBe(400 - 200 - 4);
  });

  it('should clamp left to viewport padding', () => {
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true, configurable: true });
    const result = calculatePopoverPosition(
      { x: 2, y: 100, width: 0, height: 20 },
      200,
      180,
    );
    expect(result.left).toBe(8);
  });

  it('should clamp right to viewport edge', () => {
    Object.defineProperty(window, 'innerHeight', { value: 800, writable: true, configurable: true });
    Object.defineProperty(window, 'innerWidth', { value: 300, writable: true, configurable: true });
    const result = calculatePopoverPosition(
      { x: 250, y: 100, width: 0, height: 20 },
      200,
      180,
    );
    expect(result.left).toBeLessThanOrEqual(300 - 180 - 8);
  });
});
