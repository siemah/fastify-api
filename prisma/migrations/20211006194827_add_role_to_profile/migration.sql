-- AlterTable
ALTER TABLE `Profile` ADD COLUMN `role` ENUM('DEVELOPER', 'AUTHOR') NOT NULL DEFAULT 'DEVELOPER';
