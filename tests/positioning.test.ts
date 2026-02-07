import { describe, it, expect, vi, afterEach } from 'vitest';
import { calculatePopoverPosition } from '../src/editor-component/utils/positioning.js';

describe('calculatePopoverPosition', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should place below anchor by default', () => {
    vi.stubGlobal('innerHeight', 800);
    vi.stubGlobal('innerWidth', 1024);
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
    vi.stubGlobal('innerHeight', 500);
    vi.stubGlobal('innerWidth', 1024);
    const result = calculatePopoverPosition(
      { x: 100, y: 400, width: 0, height: 20 },
      200,
      180,
    );
    expect(result.placement).toBe('above');
    expect(result.top).toBe(400 - 200 - 4);
  });

  it('should clamp left to viewport padding', () => {
    vi.stubGlobal('innerHeight', 800);
    vi.stubGlobal('innerWidth', 1024);
    const result = calculatePopoverPosition(
      { x: 2, y: 100, width: 0, height: 20 },
      200,
      180,
    );
    expect(result.left).toBe(8);
  });

  it('should clamp right to viewport edge', () => {
    vi.stubGlobal('innerHeight', 800);
    vi.stubGlobal('innerWidth', 300);
    const result = calculatePopoverPosition(
      { x: 250, y: 100, width: 0, height: 20 },
      200,
      180,
    );
    expect(result.left).toBeLessThanOrEqual(300 - 180 - 8);
  });
});
