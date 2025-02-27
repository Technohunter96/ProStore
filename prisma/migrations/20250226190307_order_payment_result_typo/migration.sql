/*
  Warnings:

  - You are about to drop the column `paymenymentResult` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "paymenymentResult",
ADD COLUMN     "paymentResult" JSON;
