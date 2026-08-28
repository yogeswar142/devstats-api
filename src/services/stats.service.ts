import { GitHubProvider } from '../providers/github/github.provider.js';
import { LeetCodeProvider } from '../providers/leetcode/leetcode.provider.js';
import { UnifiedStatsResponse, ProviderErrorInfo } from '../common/types/stats.types.js';
import { ProviderError } from '../common/errors/provider.error.js';
import { GitHubStats } from '../providers/github/github.types.js';
import { LeetCodeStats } from '../providers/leetcode/leetcode.types.js';

export class StatsService {
  private readonly githubProvider: GitHubProvider;
  private readonly leetcodeProvider: LeetCodeProvider;

  constructor() {
    this.githubProvider = new GitHubProvider();
    this.leetcodeProvider = new LeetCodeProvider();
  }

  public async getAggregatedStats(usernames?: {
    github?: string;
    leetcode?: string;
  }): Promise<{ data: UnifiedStatsResponse; statusCode: number }> {
    const [githubResult, leetcodeResult] = await Promise.allSettled([
      this.githubProvider.fetchStats(usernames?.github),
      this.leetcodeProvider.fetchStats(usernames?.leetcode),
    ]);

    let githubStats: GitHubStats | null = null;
    let leetcodeStats: LeetCodeStats | null = null;
    const errors: Record<string, ProviderErrorInfo> = {};

    if (githubResult.status === 'fulfilled') {
      githubStats = githubResult.value;
    } else {
      const reason = githubResult.reason;
      errors.github = {
        provider: 'github',
        message: reason instanceof ProviderError ? reason.message : 'GitHub statistics temporarily unavailable',
      };
    }

    if (leetcodeResult.status === 'fulfilled') {
      leetcodeStats = leetcodeResult.value;
    } else {
      const reason = leetcodeResult.reason;
      errors.leetcode = {
        provider: 'leetcode',
        message: reason instanceof ProviderError ? reason.message : 'LeetCode statistics temporarily unavailable',
      };
    }

    // Both failed case
    if (!githubStats && !leetcodeStats) {
      throw new ProviderError('aggregator', 'All statistic providers are currently unavailable', 503);
    }

    const response: UnifiedStatsResponse = {
      github: githubStats,
      leetcode: leetcodeStats,
      ...(Object.keys(errors).length > 0 && { errors }),
      lastUpdated: new Date().toISOString(),
    };

    return {
      data: response,
      statusCode: 200,
    };
  }
}
