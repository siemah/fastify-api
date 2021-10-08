/*
  Warnings:

  - A unique constraint covering the columns `[key]` on the table `ApiKeys` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `ApiKeys_key_key` ON `ApiKeys`(`key`);
