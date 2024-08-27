/*
  Warnings:

  - Added the required column `slug` to the `collections` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "collections" ADD COLUMN     "slug" VARCHAR(64) NOT NULL;
