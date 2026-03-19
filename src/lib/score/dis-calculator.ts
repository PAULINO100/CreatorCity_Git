import { GitHubStats, DISScore } from "./types";

/**
 * Calculates the Developer Influence Score (DIS) based on GitHub metadata.
 * Formula (Whitepaper v1.1 Section 06.1):
 * DIS = (stars * 3) + (commits_30d * 5) + (repos_publicos * 2) + (forks * 2) + (active_langs * 10)
 * 
 * @param userId - The ID of the user
 * @param stats - GitHub metadata statistics
 * @returns DISScore object with total and breakdown
 */
export function calculateDIS(userId: string, stats: GitHubStats): DISScore {
  const starsPart = stats.stars * 3;
  const commitsPart = stats.commits_30d * 5;
  const reposPart = stats.public_repos * 2;
  const forksPart = stats.forks * 2;
  const languagesPart = stats.active_languages * 10;

  const rawScore = starsPart + commitsPart + reposPart + forksPart + languagesPart;
  const finalScore = Math.min(rawScore, 10000);

  return {
    userId,
    score: finalScore,
    breakdown: {
      stars: starsPart,
      commits: commitsPart,
      repos: reposPart,
      forks: forksPart,
      languages: languagesPart,
    },
    calculatedAt: new Date().toISOString(),
  };
}
