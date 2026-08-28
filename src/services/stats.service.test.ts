import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StatsService } from './stats.service.js';
import { GitHubProvider } from '../providers/github/github.provider.js';
import { LeetCodeProvider } from '../providers/leetcode/leetcode.provider.js';
import { ProviderError, NotFoundError } from '../common/errors/provider.error.js';
import { GitHubStats } from '../providers/github/github.types.js';
import { LeetCodeStats } from '../providers/leetcode/leetcode.types.js';

describe('StatsService', () => {
  let statsService: StatsService;

  const mockGitHubStats: GitHubStats = {
    username: 'yogeswar142',
    name: 'Yogeswar',
    avatarUrl: 'https://github.com/yogeswar142.png',
    profileUrl: 'https://github.com/yogeswar142',
    publicRepos: 10,
    followers: 5,
    following: 2,
    totalStars: 25,
    totalForks: 10,
    languages: { TypeScript: 5, JavaScript: 3 },
    repositories: [],
  };

  const mockLeetCodeStats: LeetCodeStats = {
    username: 'Yogeswar142',
    totalSolved: 150,
    easySolved: 50,
    mediumSolved: 80,
    hardSolved: 20,
    ranking: 100000,
    contestRating: 1500,
    contestGlobalRanking: 20000,
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    statsService = new StatsService();
  });

  it('Scenario 1: should return full aggregated statistics when both providers succeed', async () => {
    vi.spyOn(GitHubProvider.prototype, 'fetchStats').mockResolvedValue(mockGitHubStats);
    vi.spyOn(LeetCodeProvider.prototype, 'fetchStats').mockResolvedValue(mockLeetCodeStats);

    const result = await statsService.getAggregatedStats();

    expect(result.statusCode).toBe(200);
    expect(result.data.github).toEqual(mockGitHubStats);
    expect(result.data.leetcode).toEqual(mockLeetCodeStats);
    expect(result.data.errors).toBeUndefined();
    expect(result.data.lastUpdated).toBeDefined();
  });

  it('Scenario 2: should return partial success (200) when GitHub succeeds and LeetCode fails', async () => {
    vi.spyOn(GitHubProvider.prototype, 'fetchStats').mockResolvedValue(mockGitHubStats);
    vi.spyOn(LeetCodeProvider.prototype, 'fetchStats').mockRejectedValue(
      new NotFoundError('leetcode', "LeetCode user 'Yogeswar142' not found")
    );

    const result = await statsService.getAggregatedStats();

    expect(result.statusCode).toBe(200);
    expect(result.data.github).toEqual(mockGitHubStats);
    expect(result.data.leetcode).toBeNull();
    expect(result.data.errors?.leetcode).toEqual({
      provider: 'leetcode',
      message: "LeetCode user 'Yogeswar142' not found",
    });
  });

  it('Scenario 3: should return partial success (200) when LeetCode succeeds and GitHub fails', async () => {
    vi.spyOn(GitHubProvider.prototype, 'fetchStats').mockRejectedValue(
      new ProviderError('github', 'GitHub API rate limit exceeded', 429)
    );
    vi.spyOn(LeetCodeProvider.prototype, 'fetchStats').mockResolvedValue(mockLeetCodeStats);

    const result = await statsService.getAggregatedStats();

    expect(result.statusCode).toBe(200);
    expect(result.data.github).toBeNull();
    expect(result.data.leetcode).toEqual(mockLeetCodeStats);
    expect(result.data.errors?.github).toEqual({
      provider: 'github',
      message: 'GitHub API rate limit exceeded',
    });
  });

  it('Scenario 4: should throw 503 ProviderError when both providers fail', async () => {
    vi.spyOn(GitHubProvider.prototype, 'fetchStats').mockRejectedValue(
      new ProviderError('github', 'GitHub API network failure', 500)
    );
    vi.spyOn(LeetCodeProvider.prototype, 'fetchStats').mockRejectedValue(
      new ProviderError('leetcode', 'LeetCode API timeout', 504)
    );

    await expect(statsService.getAggregatedStats()).rejects.toThrowError(
      new ProviderError('aggregator', 'All statistic providers are currently unavailable', 503)
    );
  });
});
