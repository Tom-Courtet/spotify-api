/*
  Warnings:

  - You are about to drop the column `email` on the `Album` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Album" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "authorId" INTEGER NOT NULL
);
INSERT INTO "new_Album" ("authorId", "id", "name") SELECT "authorId", "id", "name" FROM "Album";
DROP TABLE "Album";
ALTER TABLE "new_Album" RENAME TO "Album";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
