-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "escrow_status" TEXT NOT NULL DEFAULT 'none',
ADD COLUMN     "platform_fee_amount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "stripe_payment_intent_id" TEXT;
