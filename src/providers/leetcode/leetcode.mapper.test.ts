import { describe, it, expect } from 'vitest';
import { mapToLeetCodeStats } from './leetcode.mapper.js';
import { LeetCodeGraphQLResponse } from './leetcode.types.js';
import { NotFoundError } from '../../common/errors/provider.error.js';

describe('leetcode.mapper', () => {
  it('should map valid GraphQL response correctly regardless of difficulty array order', () => {
    const response: LeetCodeGraphQLResponse = {
      data: {
        matchedUser: {
          username: 'LeetCoder',
          profile: { ranking: 12345 },
          submitStatsGlobal: {
            acSubmissionNum: [
              { difficulty: 'Hard', count: 30, submissions: 100 },
              { difficulty: 'All', count: 250, submissions: 500 },
              { difficulty: 'Easy', count: 100, submissions: 200 },
              { difficulty: 'Medium', count: 120, submissions: 200 },
            ],
          },
        },
        userContestRanking: {
          rating: 1850.45,
          globalRanking: 5000,
          totalParticipants: 500000,
        },
      },
    };

    const stats = mapToLeetCodeStats(response, 'LeetCoder');

    expect(stats.username).toBe('LeetCoder');
    expect(stats.totalSolved).toBe(250);
    expect(stats.easySolved).toBe(100);
    expect(stats.mediumSolved).toBe(120);
    expect(stats.hardSolved).toBe(30);
    expect(stats.ranking).toBe(12345);
    expect(stats.contestRating).toBe(1850);
    expect(stats.contestGlobalRanking).toBe(5000);
  });

  it('should handle missing difficulty entries by defaulting count to 0', () => {
    const response: LeetCodeGraphQLResponse = {
      data: {
        matchedUser: {
          username: 'BeginnerUser',
          profile: { ranking: 999999 },
          submitStatsGlobal: {
            acSubmissionNum: [
              { difficulty: 'All', count: 5, submissions: 10 },
              { difficulty: 'Easy', count: 5, submissions: 10 },
            ],
          },
        },
        userContestRanking: null,
      },
    };

    const stats = mapToLeetCodeStats(response, 'BeginnerUser');

    expect(stats.totalSolved).toBe(5);
    expect(stats.easySolved).toBe(5);
    expect(stats.mediumSolved).toBe(0);
    expect(stats.hardSolved).toBe(0);
    expect(stats.contestRating).toBeNull();
    expect(stats.contestGlobalRanking).toBeNull();
  });

  it('should throw NotFoundError when GraphQL returns error indicating user does not exist', () => {
    const response: LeetCodeGraphQLResponse = {
      errors: [
        { message: 'That user does not exist.' },
      ],
      data: {
        matchedUser: null,
        userContestRanking: null,
      },
    };

    expect(() => mapToLeetCodeStats(response, 'invalid_user')).toThrowError(NotFoundError);
  });

  it('should throw NotFoundError when matchedUser is null', () => {
    const response: LeetCodeGraphQLResponse = {
      data: {
        matchedUser: null,
        userContestRanking: null,
      },
    };

    expect(() => mapToLeetCodeStats(response, 'missing_user')).toThrowError(NotFoundError);
  });
});
