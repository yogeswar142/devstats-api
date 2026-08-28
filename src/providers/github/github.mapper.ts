import { GitHubUserDTO, GitHubRepoDTO, GitHubStats, RepositoryStats } from './github.types.js';

export function mapToGitHubStats(user: GitHubUserDTO, repos: GitHubRepoDTO[]): GitHubStats {
  let totalStars = 0;
  let totalForks = 0;
  const languages: Record<string, number> = {};

  // Filter out forks so stats reflect user's owned repositories
  const ownRepos = repos.filter((r) => !r.fork);

  const mappedRepos: RepositoryStats[] = ownRepos.map((repo) => {
    totalStars += repo.stargazers_count;
    totalForks += repo.forks_count;

    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }

    return {
      name: repo.name,
      description: repo.description,
      url: repo.html_url,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      language: repo.language,
      updatedAt: repo.updated_at,
    };
  });

  // Sort repositories by stars descending, then updated date
  mappedRepos.sort((a, b) => b.stars - a.stars || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return {
    username: user.login,
    name: user.name,
    avatarUrl: user.avatar_url,
    profileUrl: user.html_url,
    publicRepos: user.public_repos,
    followers: user.followers,
    following: user.following,
    totalStars,
    totalForks,
    languages,
    repositories: mappedRepos,
  };
}
