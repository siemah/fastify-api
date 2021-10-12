/*
  Warnings:

  - Added the required column `description` to the `ApiKeys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domain` to the `ApiKeys` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ApiKeys` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ApiKeys` ADD COLUMN `description` VARCHAR(256) NOT NULL,
    ADD COLUMN `domain` VARCHAR(256) NOT NULL,
    ADD COLUMN `title` VARCHAR(100) NOT NULL;
