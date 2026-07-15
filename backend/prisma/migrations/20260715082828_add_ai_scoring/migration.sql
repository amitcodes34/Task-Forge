-- AlterTable
ALTER TABLE "bids" ADD COLUMN     "ai_flags" JSONB,
ADD COLUMN     "ai_reason" TEXT,
ADD COLUMN     "ai_score" INTEGER,
ADD COLUMN     "ai_scored_at" TIMESTAMP(3);
