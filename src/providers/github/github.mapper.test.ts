import { describe, it, expect } from 'vitest';
import { mapToGitHubStats } from './github.mapper.js';
import { GitHubUserDTO, GitHubRepoDTO } from './github.types.js';

describe('github.mapper', () => {
  const sampleUser: GitHubUserDTO = {
    login: 'testuser',
    name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
    html_url: 'https://github.com/testuser',
    public_repos: 3,
    followers: 10,
    following: 5,
  };

  const sampleRepos: GitHubRepoDTO[] = [
    {
      name: 'repo-b',
      description: 'Repo B',
      html_url: 'https://github.com/testuser/repo-b',
      stargazers_count: 50,
      forks_count: 5,
      language: 'TypeScript',
      fork: false,
      updated_at: '2026-08-20T10:00:00Z',
    },
    {
      name: 'repo-a',
      description: 'Repo A',
      html_url: 'https://github.com/testuser/repo-a',
      stargazers_count: 100,
      forks_count: 10,
      language: 'TypeScript',
      fork: false,
      updated_at: '2026-08-25T10:00:00Z',
    },
    {
      name: 'repo-c',
      description: 'Repo C',
      html_url: 'https://github.com/testuser/repo-c',
      stargazers_count: 10,
      forks_count: 2,
      language: 'Python',
      fork: false,
      updated_at: '2026-08-10T10:00:00Z',
    },
    {
      name: 'forked-repo',
      description: 'A forked repo',
      html_url: 'https://github.com/testuser/forked-repo',
      stargazers_count: 500,
      forks_count: 100,
      language: 'Go',
      fork: true, // Should be ignored in stats calculation
      updated_at: '2026-08-28T10:00:00Z',
    },
    {
      name: 'no-lang-repo',
      description: 'No language repo',
      html_url: 'https://github.com/testuser/no-lang-repo',
      stargazers_count: 5,
      forks_count: 1,
      language: null,
      fork: false,
      updated_at: '2026-08-01T10:00:00Z',
    },
  ];

  it('should map user profile correctly', () => {
    const stats = mapToGitHubStats(sampleUser, sampleRepos);
    expect(stats.username).toBe('testuser');
    expect(stats.name).toBe('Test User');
    expect(stats.avatarUrl).toBe('https://example.com/avatar.jpg');
    expect(stats.profileUrl).toBe('https://github.com/testuser');
    expect(stats.publicRepos).toBe(3);
    expect(stats.followers).toBe(10);
    expect(stats.following).toBe(5);
  });

  it('should filter out forked repositories from total stars, forks, and language breakdown', () => {
    const stats = mapToGitHubStats(sampleUser, sampleRepos);
    // Own repos: repo-b (50 stars), repo-a (100 stars), repo-c (10 stars), no-lang-repo (5 stars) = 165
    // Forked repo (500 stars) is excluded!
    expect(stats.totalStars).toBe(165);

    // Own forks: 5 + 10 + 2 + 1 = 18. Forked repo (100) is excluded!
    expect(stats.totalForks).toBe(18);

    // Forked repo language 'Go' should NOT be included!
    expect(stats.languages).toEqual({
      TypeScript: 2,
      Python: 1,
    });
  });

  it('should sort repositories by star count descending', () => {
    const stats = mapToGitHubStats(sampleUser, sampleRepos);
    expect(stats.repositories.map((r) => r.name)).toEqual([
      'repo-a',      // 100 stars
      'repo-b',      // 50 stars
      'repo-c',      // 10 stars
      'no-lang-repo' // 5 stars
    ]);
  });
});
