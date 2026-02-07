import { describe, it, expect, vi } from 'bun:test';
import { EventEmitter } from '../src/editor-component/utils/event-emitter.js';

describe('EventEmitter', () => {
  it('should call handler when event is emitted', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    emitter.on('test', handler);
    emitter.emit('test', 'data');

    expect(handler).toHaveBeenCalledWith('data');
  });

  it('should support multiple handlers', () => {
    const emitter = new EventEmitter();
    const h1 = vi.fn();
    const h2 = vi.fn();

    emitter.on('test', h1);
    emitter.on('test', h2);
    emitter.emit('test', 42);

    expect(h1).toHaveBeenCalledWith(42);
    expect(h2).toHaveBeenCalledWith(42);
  });

  it('should remove handler with off', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    emitter.on('test', handler);
    emitter.off('test', handler);
    emitter.emit('test', 'data');

    expect(handler).not.toHaveBeenCalled();
  });

  it('should return unsubscribe function from on()', () => {
    const emitter = new EventEmitter();
    const handler = vi.fn();

    const unsub = emitter.on('test', handler);
    unsub();
    emitter.emit('test', 'data');

    expect(handler).not.toHaveBeenCalled();
  });

  it('should remove all listeners for an event', () => {
    const emitter = new EventEmitter();
    const h1 = vi.fn();
    const h2 = vi.fn();

    emitter.on('test', h1);
    emitter.on('test', h2);
    emitter.removeAllListeners('test');
    emitter.emit('test', 'data');

    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
  });

  it('should remove all listeners when no event specified', () => {
    const emitter = new EventEmitter();
    const h1 = vi.fn();
    const h2 = vi.fn();

    emitter.on('a', h1);
    emitter.on('b', h2);
    emitter.removeAllListeners();
    emitter.emit('a', null);
    emitter.emit('b', null);

    expect(h1).not.toHaveBeenCalled();
    expect(h2).not.toHaveBeenCalled();
  });

  it('should not throw when emitting events with no handlers', () => {
    const emitter = new EventEmitter();
    expect(() => emitter.emit('missing', 'data')).not.toThrow();
  });
});
