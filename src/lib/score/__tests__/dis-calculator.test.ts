import { calculateDIS } from "../dis-calculator";
import { GitHubStats } from "../types";

describe("DIS Calculator (Phase 0)", () => {
  const userId = "test-user-123";

  test("should calculate score for a newcomer (low activity)", () => {
    const stats: GitHubStats = {
      stars: 5,
      commits_30d: 2,
      public_repos: 3,
      forks: 1,
      active_languages: 2,
    };
    // (5*3) + (2*5) + (3*2) + (1*2) + (2*10) = 15 + 10 + 6 + 2 + 20 = 53
    const result = calculateDIS(userId, stats);
    expect(result.score).toBe(53);
  });

  test("should calculate score for a mid-level developer", () => {
    const stats: GitHubStats = {
      stars: 50,
      commits_30d: 40,
      public_repos: 15,
      forks: 10,
      active_languages: 5,
    };
    // (50*3) + (40*5) + (15*2) + (10*2) + (5*10) = 150 + 200 + 30 + 20 + 50 = 450
    const result = calculateDIS(userId, stats);
    expect(result.score).toBe(450);
  });

  test("should calculate score for a senior developer", () => {
    const stats: GitHubStats = {
      stars: 500,
      commits_30d: 120,
      public_repos: 45,
      forks: 80,
      active_languages: 8,
    };
    // (500*3) + (120*5) + (45*2) + (80*2) + (8*10) = 1500 + 600 + 90 + 160 + 80 = 2430
    const result = calculateDIS(userId, stats);
    expect(result.score).toBe(2430);
  });

  test("should enforce the 10,000 point ceiling", () => {
    const stats: GitHubStats = {
      stars: 5000,
      commits_30d: 1000,
      public_repos: 500,
      forks: 1000,
      active_languages: 20,
    };
    // (5000*3) + (1000*5) + ... = 15000 + 5000 + ... clearly > 10000
    const result = calculateDIS(userId, stats);
    expect(result.score).toBe(10000);
  });

  test("should return 0 for inactive users", () => {
    const stats: GitHubStats = {
      stars: 0,
      commits_30d: 0,
      public_repos: 0,
      forks: 0,
      active_languages: 0,
    };
    const result = calculateDIS(userId, stats);
    expect(result.score).toBe(0);
  });
});
