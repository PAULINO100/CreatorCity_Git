-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PeerVote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "voter_id" TEXT NOT NULL,
    "target_user_id" TEXT NOT NULL,
    "vote_value" REAL NOT NULL DEFAULT 0.0,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "decay_factor" REAL NOT NULL DEFAULT 1.0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" DATETIME,
    "is_reciprocal" BOOLEAN NOT NULL DEFAULT false,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "PeerVote_voter_id_fkey" FOREIGN KEY ("voter_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PeerVote_target_user_id_fkey" FOREIGN KEY ("target_user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PeerVote" ("created_at", "expires_at", "id", "is_reciprocal", "target_user_id", "vote_value", "voter_id", "weight") SELECT "created_at", "expires_at", "id", "is_reciprocal", "target_user_id", "vote_value", "voter_id", "weight" FROM "PeerVote";
DROP TABLE "PeerVote";
ALTER TABLE "new_PeerVote" RENAME TO "PeerVote";
CREATE INDEX "PeerVote_target_user_id_idx" ON "PeerVote"("target_user_id");
CREATE INDEX "PeerVote_voter_id_target_user_id_idx" ON "PeerVote"("voter_id", "target_user_id");
CREATE INDEX "PeerVote_created_at_idx" ON "PeerVote"("created_at");
PRAGMA foreign_key_check("PeerVote");
PRAGMA foreign_keys=ON;
