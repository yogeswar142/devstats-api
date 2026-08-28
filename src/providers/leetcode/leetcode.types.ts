// External GraphQL DTOs
export interface SubmissionCountDTO {
  difficulty: string;
  count: number;
  submissions: number;
}

export interface SubmitStatsDTO {
  acSubmissionNum: SubmissionCountDTO[];
}

export interface ProfileDTO {
  ranking: number | null;
}

export interface MatchedUserDTO {
  username: string;
  profile: ProfileDTO | null;
  submitStatsGlobal: SubmitStatsDTO | null;
}

export interface ContestRankingDTO {
  rating: number | null;
  globalRanking: number | null;
  totalParticipants: number | null;
}

export interface GraphQLErrorItem {
  message: string;
  path?: string[];
}

export interface LeetCodeGraphQLResponse {
  data?: {
    matchedUser: MatchedUserDTO | null;
    userContestRanking: ContestRankingDTO | null;
  };
  errors?: GraphQLErrorItem[];
}

// Normalized Internal Domain Model
export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number | null;
  contestRating: number | null;
  contestGlobalRanking: number | null;
}
