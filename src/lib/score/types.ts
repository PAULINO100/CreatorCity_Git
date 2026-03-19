export interface GitHubStats {
  stars: number;
  commits_30d: number;
  public_repos: number;
  forks: number;
  active_languages: number;
}

export interface DISScore {
  userId: string;
  score: number;
  breakdown: {
    stars: number;
    commits: number;
    repos: number;
    forks: number;
    languages: number;
  };
  calculatedAt: string;
}
