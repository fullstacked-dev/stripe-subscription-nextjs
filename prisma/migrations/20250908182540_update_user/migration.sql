-- CreateEnum
CREATE TYPE "public"."Plan" AS ENUM ('free', 'premium', 'pro');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "plan" "public"."Plan" NOT NULL DEFAULT 'free',
ADD COLUMN     "stripeCurrentPeriodEnd" TIMESTAMP(3),
ADD COLUMN     "stripeCustomerId" TEXT,
ADD COLUMN     "stripePriceId" TEXT,
ADD COLUMN     "stripeSubscriptionId" TEXT;
