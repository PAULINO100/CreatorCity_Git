import { calculateVoteWeight, applyTemporalDecay } from "../peer-trust";

describe("Peer Trust Logic (v1.0)", () => {
  
  describe("calculateVoteWeight", () => {
    test("should return 1.0 for a max score of 10,000", () => {
      expect(calculateVoteWeight(10000)).toBe(1.0);
    });

    test("should return 0.5 for a score of 2,500 (sqrt of 0.25)", () => {
      expect(calculateVoteWeight(2500)).toBe(0.5);
    });

    test("should return 0.1 for a score of 100 (sqrt of 0.01)", () => {
      expect(calculateVoteWeight(100)).toBeCloseTo(0.1, 5);
    });

    test("should return 0.0 for a score of 0", () => {
      expect(calculateVoteWeight(0)).toBe(0);
    });
  });

  describe("applyTemporalDecay", () => {
    test("should return 1.0 for a new vote", () => {
      const now = new Date();
      expect(applyTemporalDecay(now)).toBeCloseTo(1.0, 5);
    });

    test("should return ~0.9 for a 90-day old vote", () => {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      expect(applyTemporalDecay(ninetyDaysAgo)).toBeCloseTo(0.9, 2);
    });

    test("should return ~0.81 for a 180-day old vote", () => {
      const longAgo = new Date();
      longAgo.setDate(longAgo.getDate() - 180);
      expect(applyTemporalDecay(longAgo)).toBeCloseTo(0.81, 2);
    });
  });
});
