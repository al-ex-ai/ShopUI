/**
 * Client-Side Schema Cache
 *
 * Implements stale-while-revalidate:
 * 1. Return cached response immediately
 * 2. Fetch fresh data in the background
 * 3. Update cache when fresh data arrives
 */

interface CacheEntry {
  data: unknown;
  timestamp: number;
  ttl: number;
}

class SchemaCache {
  private store = new Map<string, CacheEntry>();
  private defaultTTL = 60_000; // 1 minute

  get<T>(key: string): { data: T; isStale: boolean } | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    const isStale = Date.now() - entry.timestamp > entry.ttl;
    return { data: entry.data as T, isStale };
  }

  set(key: string, data: unknown, ttl?: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    });
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

export const schemaCache = new SchemaCache();
