/*
  Warnings:

  - You are about to drop the column `firstPlayer` on the `Party` table. All the data in the column will be lost.
  - You are about to drop the column `selected` on the `Party` table. All the data in the column will be lost.
  - Added the required column `inviteCode` to the `Party` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Party` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player1Id` to the `Party` table without a default value. This is not possible if the table is not empty.
  - Added the required column `player2Id` to the `Party` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Party` table without a default value. This is not possible if the table is not empty.
  - Made the column `ownerId` on table `Party` required. This step will fail if there are existing NULL values in that column.
  - Made the column `partyId` on table `Pion` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "VisitorUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "partyId" INTEGER NOT NULL,
    CONSTRAINT "VisitorUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "VisitorUser_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Party" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "isFilling" BOOLEAN NOT NULL DEFAULT false,
    "isMoving" BOOLEAN NOT NULL DEFAULT false,
    "isCutting" BOOLEAN NOT NULL DEFAULT false,
    "tourId" INTEGER NOT NULL DEFAULT 1,
    "tourNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "player1Id" INTEGER NOT NULL,
    "player2Id" INTEGER NOT NULL,
    CONSTRAINT "Party_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Party_player1Id_fkey" FOREIGN KEY ("player1Id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Party_player2Id_fkey" FOREIGN KEY ("player2Id") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Party" ("id", "isCutting", "isFilling", "isMoving", "ownerId", "tourId", "tourNumber") SELECT "id", "isCutting", "isFilling", "isMoving", "ownerId", "tourId", "tourNumber" FROM "Party";
DROP TABLE "Party";
ALTER TABLE "new_Party" RENAME TO "Party";
CREATE UNIQUE INDEX "Party_inviteCode_key" ON "Party"("inviteCode");
CREATE TABLE "new_Pion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "abs" INTEGER NOT NULL,
    "ord" INTEGER NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#e5e7eb',
    "partyId" INTEGER NOT NULL,
    CONSTRAINT "Pion_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pion" ("abs", "color", "id", "ord", "partyId") SELECT "abs", "color", "id", "ord", "partyId" FROM "Pion";
DROP TABLE "Pion";
ALTER TABLE "new_Pion" RENAME TO "Pion";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "pionNumber" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "gameLimit" INTEGER NOT NULL DEFAULT 7,
    "winNumber" INTEGER NOT NULL DEFAULT 0,
    "lostNumber" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("color", "gameLimit", "id", "lostNumber", "password", "pionNumber", "score", "username", "winNumber") SELECT "color", "gameLimit", "id", "lostNumber", "password", "pionNumber", "score", "username", "winNumber" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "VisitorUser_userId_partyId_key" ON "VisitorUser"("userId", "partyId");
