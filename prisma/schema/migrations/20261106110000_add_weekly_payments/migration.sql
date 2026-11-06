-- CreateTable
CREATE TABLE IF NOT EXISTS "workers"."weekly_payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "payment_date" DATE NOT NULL,
    "day_of_week" VARCHAR(50),
    "amount_paise" BIGINT NOT NULL,
    "paid_by" VARCHAR(255) NOT NULL,
    "payment_method" VARCHAR(50) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "weekly_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_weekly_payments_worker_date" ON "workers"."weekly_payments"("worker_id", "payment_date" DESC);
CREATE INDEX IF NOT EXISTS "idx_weekly_payments_bu_worker" ON "workers"."weekly_payments"("business_unit_id", "worker_id");

-- AddForeignKey
ALTER TABLE "workers"."weekly_payments" ADD CONSTRAINT "fk_weekly_payments_worker" FOREIGN KEY ("worker_id") REFERENCES "workers"."profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
ALTER TABLE "workers"."weekly_payments" ADD CONSTRAINT "fk_weekly_payments_bu" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
ALTER TABLE "workers"."weekly_payments" ADD CONSTRAINT "fk_weekly_payments_user" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

