import { describe, it, expect, beforeEach, vi } from 'vitest';
import { buildApp } from '../app.js';
import { GitHubProvider } from '../providers/github/github.provider.js';
import { LeetCodeProvider } from '../providers/leetcode/leetcode.provider.js';
import { GitHubStats } from '../providers/github/github.types.js';
import { LeetCodeStats } from '../providers/leetcode/leetcode.types.js';

describe('Fastify Routes Integration', () => {
  const app = buildApp();

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
    languages: { TypeScript: 5 },
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
  });

  it('GET /health should return 200 and health info', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.status).toBe('ok');
    expect(body.service).toBe('devstats-api');
    expect(body.timestamp).toBeDefined();
    expect(body.uptime).toBeGreaterThanOrEqual(0);
  });

  it('GET /api/v1/github should return 200 with github stats', async () => {
    vi.spyOn(GitHubProvider.prototype, 'fetchStats').mockResolvedValue(mockGitHubStats);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/github?username=yogeswar142',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.username).toBe('yogeswar142');
    expect(body.totalStars).toBe(25);
  });

  it('GET /api/v1/leetcode should return 200 with leetcode stats', async () => {
    vi.spyOn(LeetCodeProvider.prototype, 'fetchStats').mockResolvedValue(mockLeetCodeStats);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/leetcode?username=Yogeswar142',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.username).toBe('Yogeswar142');
    expect(body.totalSolved).toBe(150);
  });

  it('GET /api/v1/stats should return 200 with aggregated stats', async () => {
    vi.spyOn(GitHubProvider.prototype, 'fetchStats').mockResolvedValue(mockGitHubStats);
    vi.spyOn(LeetCodeProvider.prototype, 'fetchStats').mockResolvedValue(mockLeetCodeStats);

    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/stats',
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.github.username).toBe('yogeswar142');
    expect(body.leetcode.username).toBe('Yogeswar142');
    expect(body.lastUpdated).toBeDefined();
  });
});
