import { BaseProvider } from '../base.provider.js';
import { LeetCodeGraphQLResponse, LeetCodeStats } from './leetcode.types.js';
import { LEETCODE_USER_STATS_QUERY } from './leetcode.queries.js';
import { mapToLeetCodeStats } from './leetcode.mapper.js';
import { ProviderError } from '../../common/errors/provider.error.js';
import { env } from '../../config/env.js';
import { TTLCache } from '../../common/cache/ttl-cache.js';

// Shared static cache across all LeetCodeProvider instances
const leetcodeCache = new TTLCache<LeetCodeStats>();

export class LeetCodeProvider implements BaseProvider<LeetCodeStats> {
  public readonly name = 'leetcode';
  private readonly graphqlUrl = 'https://leetcode.com/graphql/';

  public async fetchStats(targetUsername?: string): Promise<LeetCodeStats> {
    const username = targetUsername || env.LEETCODE_USERNAME;

    if (!username || username.trim() === '') {
      throw new ProviderError(this.name, 'LeetCode username is not configured', 400);
    }

    const cacheKey = `leetcode:${username.toLowerCase().trim()}`;
    const cachedStats = leetcodeCache.get(cacheKey);

    if (cachedStats) {
      return cachedStats;
    }

    try {
      const response = await fetch(this.graphqlUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Referer: 'https://leetcode.com',
        },
        body: JSON.stringify({
          query: LEETCODE_USER_STATS_QUERY,
          variables: { username },
        }),
        signal: AbortSignal.timeout(8000),
      });

      if (!response.ok) {
        throw new ProviderError(
          this.name,
          `LeetCode GraphQL endpoint error (status ${response.status})`,
          response.status
        );
      }

      const jsonResponse = (await response.json()) as LeetCodeGraphQLResponse;
      const stats = mapToLeetCodeStats(jsonResponse, username);

      // Cache successful normalized response
      leetcodeCache.set(cacheKey, stats, env.LEETCODE_CACHE_TTL_MS);

      return stats;
    } catch (error: any) {
      if (error instanceof ProviderError) {
        throw error;
      }
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new ProviderError(this.name, 'Request to LeetCode API timed out', 504);
      }
      throw new ProviderError(this.name, `Failed to fetch LeetCode stats: ${error.message}`, 500);
    }
  }
}
