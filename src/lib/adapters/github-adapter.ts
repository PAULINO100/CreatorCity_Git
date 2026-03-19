import { GitHubStats } from "../score/types";

/**
 * Fetches and normalizes GitHub statistics for a given user.
 * In a real scenario, this would call the GitHub REST/GraphQL API using the provided token.
 * 
 * @param username - GitHub username (or user object from DB)
 * @param token - OAuth access token for authorized requests
 * @returns Normalized GitHubStats object
 */
export async function fetchGitHubStats(username: string, token: string): Promise<GitHubStats> {
  // TODO: Implement real Octokit call here.
  // For Phase 0 / Staging, we use mock logic based on common profiles if real API fails.
  
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) throw new Error("GitHub API failed");

    const data = await response.json();
    
    // This is a simplified fetch. Real commits_30d requires searching commits.
    // We mock the granular parts that require multiple API calls for now.
    return {
      stars: data.public_repos * 2, // Mock estimation
      commits_30d: 15, // Mock estimation
      public_repos: data.public_repos,
      forks: data.public_repos / 2, // Mock estimation
      active_languages: 3, // Mock estimation
    };
  } catch (error) {
    console.error("GitHub Adapter Error:", error);
    // Fallback safe mock for demo
    return {
      stars: 10,
      commits_30d: 5,
      public_repos: 5,
      forks: 2,
      active_languages: 2,
    };
  }
}
