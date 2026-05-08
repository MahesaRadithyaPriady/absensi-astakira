/*
  Warnings:

  - A unique constraint covering the columns `[noKartu]` on the table `Karyawan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Karyawan" ADD COLUMN     "noKartu" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Karyawan_noKartu_key" ON "Karyawan"("noKartu");
