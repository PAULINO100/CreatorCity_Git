export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  stargazers_count: number;
  language: string;
  description: string;
  owner: {
    login: string;
    id: number;
    avatar_url: string;
    url: string;
  };
}

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  name: string;
  bio: string;
  location: string;
  public_repos: number;
  followers: number;
  following: number;
}

export interface ImportStats {
  totalFetched: number;
  usersCreated: number;
  buildingsCreated: number;
  duplicatesSkipped: number;
  errors: string[];
}
