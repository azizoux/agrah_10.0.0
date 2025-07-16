-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "pionNumber" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER NOT NULL DEFAULT 0,
    "gameLimit" INTEGER NOT NULL DEFAULT 7,
    "winNumber" INTEGER NOT NULL DEFAULT 0,
    "lostNumber" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Pion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "abs" INTEGER NOT NULL,
    "ord" INTEGER NOT NULL,
    "partyId" INTEGER,
    CONSTRAINT "Pion_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Party" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "isFilling" BOOLEAN NOT NULL DEFAULT false,
    "isMoving" BOOLEAN NOT NULL DEFAULT false,
    "isCutting" BOOLEAN NOT NULL DEFAULT false,
    "tourId" INTEGER NOT NULL DEFAULT 1,
    "tourNumber" INTEGER NOT NULL DEFAULT 1,
    "selected" TEXT NOT NULL,
    "firstPlayer" INTEGER NOT NULL DEFAULT 1,
    "ownerId" INTEGER,
    CONSTRAINT "Party_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
