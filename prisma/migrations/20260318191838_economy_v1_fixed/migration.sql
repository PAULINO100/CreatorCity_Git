/*
  Warnings:

  - You are about to alter the column `balance` on the `CityCredit` table. The data in that column could be lost. The data in that column will be cast from `Float` to `Int`.
  - Added the required column `updated_at` to the `CityCredit` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CityCredit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "last_claim_at" DATETIME,
    "reputation_points" INTEGER NOT NULL DEFAULT 0,
    "transaction_history" TEXT NOT NULL DEFAULT '[]',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "CityCredit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CityCredit" ("balance", "id", "last_claim_at", "reputation_points", "user_id") SELECT "balance", "id", "last_claim_at", "reputation_points", "user_id" FROM "CityCredit";
DROP TABLE "CityCredit";
ALTER TABLE "new_CityCredit" RENAME TO "CityCredit";
CREATE UNIQUE INDEX "CityCredit_user_id_key" ON "CityCredit"("user_id");
CREATE INDEX "CityCredit_user_id_idx" ON "CityCredit"("user_id");
PRAGMA foreign_key_check("CityCredit");
PRAGMA foreign_keys=ON;
