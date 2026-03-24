/**
 * IP Reputation System for Atlas City
 */

interface ReputationRecord {
  score: number;
  lastUpdate: number;
  isVerified: boolean;
  violations: string[];
}

const REPUTATION_STORAGE = new Map<string, ReputationRecord>();

const SCORES = {
  INITIAL: 100,
  EXCEED_RATE_LIMIT: -10,
  MALICIOUS_INPUT: -25,
  PROMPT_INJECTION: -50,
  BOT_BEHAVIOR: -30,
  VERIFIED_EMAIL: +20,
  DAILY_GOOD_USE: +5
};

export function getIpReputation(ip: string) {
  let record = REPUTATION_STORAGE.get(ip);
  if (!record) {
    record = {
      score: SCORES.INITIAL,
      lastUpdate: Date.now(),
      isVerified: false,
      violations: []
    };
    REPUTATION_STORAGE.set(ip, record);
  }
  return record;
}

export function updateReputation(ip: string, action: keyof typeof SCORES, detail?: string) {
  const record = getIpReputation(ip);
  record.score += SCORES[action];
  record.lastUpdate = Date.now();
  if (detail) record.violations.push(`${new Date().toISOString()}: ${detail}`);
  
  // Clamping
  if (record.score > 200) record.score = 200;
  if (record.score < -100) record.score = -100;
  
  return record;
}

export function getSecurityAction(score: number) {
  if (score < 0) return 'BLOCK_PERMANENT';
  if (score < 20) return 'BLOCK_TEMPORARY';
  if (score < 50) return 'REQUIRE_CAPTCHA';
  return 'ALLOW';
}
