import { LeetCodeGraphQLResponse, LeetCodeStats } from './leetcode.types.js';
import { NotFoundError } from '../../common/errors/provider.error.js';

export function mapToLeetCodeStats(response: LeetCodeGraphQLResponse, requestedUsername: string): LeetCodeStats {
  if (response.errors && response.errors.length > 0) {
    const isUserNotFound = response.errors.some((err) =>
      err.message.toLowerCase().includes('does not exist')
    );
    if (isUserNotFound) {
      throw new NotFoundError('leetcode', `LeetCode user '${requestedUsername}' not found`);
    }
  }

  const matchedUser = response.data?.matchedUser;

  if (!matchedUser) {
    throw new NotFoundError('leetcode', `LeetCode user '${requestedUsername}' not found`);
  }

  const acSubmissions = matchedUser.submitStatsGlobal?.acSubmissionNum || [];

  const findCount = (difficultyName: string): number => {
    const item = acSubmissions.find(
      (s) => s.difficulty.toLowerCase() === difficultyName.toLowerCase()
    );
    return item ? item.count : 0;
  };

  const totalSolved = findCount('All');
  const easySolved = findCount('Easy');
  const mediumSolved = findCount('Medium');
  const hardSolved = findCount('Hard');

  const ranking = matchedUser.profile?.ranking ?? null;

  const contestRanking = response.data?.userContestRanking;
  const contestRating = contestRanking?.rating ? Math.round(contestRanking.rating) : null;
  const contestGlobalRanking = contestRanking?.globalRanking ?? null;

  return {
    username: matchedUser.username || requestedUsername,
    totalSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    ranking,
    contestRating,
    contestGlobalRanking,
  };
}
