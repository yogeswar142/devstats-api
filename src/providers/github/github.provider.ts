import { BaseProvider } from '../base.provider.js';
import { GitHubUserDTO, GitHubRepoDTO, GitHubStats } from './github.types.js';
import { mapToGitHubStats } from './github.mapper.js';
import { ProviderError, NotFoundError, RateLimitError } from '../../common/errors/provider.error.js';
import { env } from '../../config/env.js';
import { TTLCache } from '../../common/cache/ttl-cache.js';

// Shared static cache across all GitHubProvider instances
const githubCache = new TTLCache<GitHubStats>();

export class GitHubProvider implements BaseProvider<GitHubStats> {
  public readonly name = 'github';
  private readonly baseUrl = 'https://api.github.com';

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'DevStats-API',
    };

    if (env.GITHUB_TOKEN && env.GITHUB_TOKEN.trim() !== '') {
      headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
    }

    return headers;
  }

  public async fetchStats(targetUsername?: string): Promise<GitHubStats> {
    const username = targetUsername || env.GITHUB_USERNAME;

    if (!username || username.trim() === '') {
      throw new ProviderError(this.name, 'GitHub username is not configured', 400);
    }

    const cacheKey = `github:${username.toLowerCase().trim()}`;
    const cachedStats = githubCache.get(cacheKey);

    if (cachedStats) {
      return cachedStats;
    }

    const headers = this.getHeaders();

    try {
      const [userResponse, reposResponse] = await Promise.all([
        fetch(`${this.baseUrl}/users/${username}`, {
          headers,
          signal: AbortSignal.timeout(8000),
        }),
        fetch(`${this.baseUrl}/users/${username}/repos?per_page=100&type=owner&sort=updated`, {
          headers,
          signal: AbortSignal.timeout(8000),
        }),
      ]);

      if (userResponse.status === 404) {
        throw new NotFoundError(this.name, `GitHub user '${username}' not found`);
      }

      if (userResponse.status === 403 || userResponse.status === 429) {
        throw new RateLimitError(this.name, 'GitHub API rate limit exceeded');
      }

      if (!userResponse.ok) {
        throw new ProviderError(this.name, `GitHub User API error (status ${userResponse.status})`, userResponse.status);
      }

      if (!reposResponse.ok) {
        throw new ProviderError(this.name, `GitHub Repos API error (status ${reposResponse.status})`, reposResponse.status);
      }

      const userDto = (await userResponse.json()) as GitHubUserDTO;
      const reposDto = (await reposResponse.json()) as GitHubRepoDTO[];

      const stats = mapToGitHubStats(userDto, reposDto);

      // Cache successful normalized response
      githubCache.set(cacheKey, stats, env.GITHUB_CACHE_TTL_MS);

      return stats;
    } catch (error: any) {
      if (error instanceof ProviderError) {
        throw error;
      }
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new ProviderError(this.name, 'Request to GitHub API timed out', 504);
      }
      throw new ProviderError(this.name, `Failed to fetch GitHub stats: ${error.message}`, 500);
    }
  }
}
