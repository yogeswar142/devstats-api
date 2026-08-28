import { GitHubStats } from '../../providers/github/github.types.js';
import { LeetCodeStats } from '../../providers/leetcode/leetcode.types.js';

export interface ProviderErrorInfo {
  provider: string;
  message: string;
}

export interface UnifiedStatsResponse {
  github: GitHubStats | null;
  leetcode: LeetCodeStats | null;
  errors?: Record<string, ProviderErrorInfo>;
  lastUpdated: string;
}
