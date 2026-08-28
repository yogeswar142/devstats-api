import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TTLCache } from './ttl-cache.js';

describe('TTLCache', () => {
  let cache: TTLCache<string>;

  beforeEach(() => {
    cache = new TTLCache<string>();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return null for cache miss', () => {
    expect(cache.get('nonexistent')).toBeNull();
    expect(cache.has('nonexistent')).toBe(false);
  });

  it('should set and get unexpired cache entry', () => {
    cache.set('user:1', 'Alice', 5000);
    expect(cache.get('user:1')).toBe('Alice');
    expect(cache.has('user:1')).toBe(true);
  });

  it('should expire entry after TTL elapses', () => {
    cache.set('user:1', 'Alice', 1000);

    // Advance 999ms - entry should still exist
    vi.advanceTimersByTime(999);
    expect(cache.get('user:1')).toBe('Alice');

    // Advance 2ms (total 1001ms) - entry should be expired
    vi.advanceTimersByTime(2);
    expect(cache.get('user:1')).toBeNull();
    expect(cache.has('user:1')).toBe(false);
  });

  it('should delete entries properly', () => {
    cache.set('key1', 'val1', 5000);
    expect(cache.delete('key1')).toBe(true);
    expect(cache.get('key1')).toBeNull();
    expect(cache.delete('key1')).toBe(false);
  });

  it('should clear all entries', () => {
    cache.set('key1', 'val1', 5000);
    cache.set('key2', 'val2', 5000);
    expect(cache.size()).toBe(2);

    cache.clear();
    expect(cache.size()).toBe(0);
    expect(cache.get('key1')).toBeNull();
    expect(cache.get('key2')).toBeNull();
  });
});
