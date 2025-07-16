/*
  Warnings:

  - Added the required column `color` to the `Pion` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "abs" INTEGER NOT NULL,
    "ord" INTEGER NOT NULL,
    "partyId" INTEGER,
    "color" TEXT NOT NULL,
    CONSTRAINT "Pion_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Pion" ("abs", "id", "ord", "partyId") SELECT "abs", "id", "ord", "partyId" FROM "Pion";
DROP TABLE "Pion";
ALTER TABLE "new_Pion" RENAME TO "Pion";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
