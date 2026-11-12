-- CreateEnum
CREATE TYPE "FoodDateType" AS ENUM ('EXPIRATION', 'BEST_BEFORE', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "FoodStorageCondition" AS ENUM ('AMBIENT', 'REFRIGERATED', 'FROZEN');

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "batchNumber" TEXT,
ADD COLUMN     "dateType" "FoodDateType",
ADD COLUMN     "expirationDate" TIMESTAMP(3),
ADD COLUMN     "safetyNotes" TEXT,
ADD COLUMN     "storageCondition" "FoodStorageCondition";
