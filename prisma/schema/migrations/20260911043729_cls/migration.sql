-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "app_auth";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "audit";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "core";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "finance";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "inventory";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "materials";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "parties";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "production";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "sales";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "transport";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "workers";

-- CreateTable
CREATE TABLE "audit"."events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID,
    "actor_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" UUID,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_auth"."sessions" (
    "id" VARCHAR(255) NOT NULL,
    "user_id" UUID NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "app_auth"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(50) NOT NULL DEFAULT 'ADMIN',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."brick_grades" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "brick_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."brick_types" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "dimensions" VARCHAR(100),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "brick_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."business_units" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "business_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."expense_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."material_units" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "material_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "core"."payment_methods" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."allocations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "payment_id" UUID NOT NULL,
    "charge_id" UUID NOT NULL,
    "amount_paise" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."charges" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "party_type" VARCHAR(50) NOT NULL,
    "party_id" UUID,
    "charge_type" VARCHAR(50) NOT NULL,
    "reference_id" UUID,
    "charge_date" DATE NOT NULL,
    "amount_paise" BIGINT NOT NULL,
    "allocated_amount_paise" BIGINT NOT NULL DEFAULT 0,
    "status" VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    "description" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "charges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "batch_id" UUID,
    "expense_date" DATE NOT NULL,
    "amount_paise" BIGINT NOT NULL,
    "payee_name" VARCHAR(255),
    "payment_method_id" UUID NOT NULL,
    "charge_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."payments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "payment_number" VARCHAR(100) NOT NULL,
    "direction" VARCHAR(20) NOT NULL,
    "party_type" VARCHAR(50) NOT NULL,
    "party_id" UUID,
    "payment_date" DATE NOT NULL,
    "amount_paise" BIGINT NOT NULL,
    "allocated_amount_paise" BIGINT NOT NULL DEFAULT 0,
    "payment_method_id" UUID NOT NULL,
    "reference_number" VARCHAR(100),
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finance"."settlements" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "settlement_number" VARCHAR(100) NOT NULL,
    "worker_id" UUID NOT NULL,
    "period_start_date" DATE NOT NULL,
    "period_end_date" DATE NOT NULL,
    "total_bricks" INTEGER NOT NULL,
    "gross_amount_paise" BIGINT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    "approved_at" TIMESTAMPTZ(6),
    "approved_by" UUID,
    "voided_at" TIMESTAMPTZ(6),
    "voided_by" UUID,
    "void_reason" TEXT,
    "charge_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."finished_lots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "batch_id" UUID,
    "brick_type_id" UUID NOT NULL,
    "brick_grade_id" UUID NOT NULL,
    "lot_number" VARCHAR(100) NOT NULL,
    "initial_quantity" INTEGER NOT NULL,
    "available_quantity" INTEGER NOT NULL,
    "unit_cost_paise" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "finished_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."stock_adjustments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "finished_lot_id" UUID NOT NULL,
    "adjustment_type" VARCHAR(50) NOT NULL,
    "quantity_change" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "adjustment_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory"."stock_ledger" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "finished_lot_id" UUID,
    "brick_type_id" UUID NOT NULL,
    "brick_grade_id" UUID,
    "transaction_type" VARCHAR(50) NOT NULL,
    "quantity_change" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "reference_id" UUID,
    "transaction_date" DATE NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "stock_ledger_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials"."catalogue" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "unit_id" UUID NOT NULL,
    "reorder_level" DECIMAL(14,3) NOT NULL DEFAULT 0,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "catalogue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials"."consumption" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "batch_id" UUID,
    "material_lot_id" UUID NOT NULL,
    "consumption_date" DATE NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "cost_paise" BIGINT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "consumption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials"."lots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "purchase_id" UUID,
    "lot_number" VARCHAR(100) NOT NULL,
    "initial_quantity" DECIMAL(14,3) NOT NULL,
    "available_quantity" DECIMAL(14,3) NOT NULL,
    "unit_cost_paise" BIGINT NOT NULL,
    "received_date" DATE NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials"."purchases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "purchase_number" VARCHAR(100) NOT NULL,
    "supplier_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "purchase_date" DATE NOT NULL,
    "quantity" DECIMAL(14,3) NOT NULL,
    "unit_price_paise" BIGINT NOT NULL,
    "total_amount_paise" BIGINT NOT NULL,
    "charge_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties"."customers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties"."suppliers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "contact_person" VARCHAR(255),
    "phone" VARCHAR(20),
    "address" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production"."batches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "batch_number" VARCHAR(100) NOT NULL,
    "brick_type_id" UUID NOT NULL,
    "stage" VARCHAR(50) NOT NULL DEFAULT 'MOULDING',
    "target_quantity" INTEGER NOT NULL DEFAULT 0,
    "moulded_quantity" INTEGER NOT NULL DEFAULT 0,
    "dried_quantity" INTEGER NOT NULL DEFAULT 0,
    "fired_good_quantity" INTEGER NOT NULL DEFAULT 0,
    "damaged_quantity" INTEGER NOT NULL DEFAULT 0,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "status" VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production"."daily_moulding_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "batch_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "work_date" DATE NOT NULL,
    "bricks_moulded" INTEGER NOT NULL,
    "rate_per_1000_paise" BIGINT NOT NULL,
    "earned_amount_paise" BIGINT NOT NULL,
    "settlement_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "daily_moulding_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production"."stage_transitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "batch_id" UUID NOT NULL,
    "from_stage" VARCHAR(50) NOT NULL,
    "to_stage" VARCHAR(50) NOT NULL,
    "transition_date" DATE NOT NULL,
    "input_quantity" INTEGER NOT NULL,
    "output_good_quantity" INTEGER NOT NULL,
    "damaged_quantity" INTEGER NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "stage_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "sale_number" VARCHAR(100) NOT NULL,
    "customer_id" UUID NOT NULL,
    "brick_type_id" UUID NOT NULL,
    "brick_grade_id" UUID NOT NULL,
    "sale_date" DATE NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price_paise" BIGINT NOT NULL,
    "total_amount_paise" BIGINT NOT NULL,
    "cost_amount_paise" BIGINT NOT NULL DEFAULT 0,
    "charge_id" UUID,
    "vehicle_id" UUID,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales"."stock_allocations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "sale_id" UUID NOT NULL,
    "finished_lot_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lot_unit_cost_paise" BIGINT NOT NULL,
    "total_cost_paise" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "stock_allocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport"."trips" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "vehicle_id" UUID NOT NULL,
    "batch_id" UUID,
    "sale_id" UUID,
    "trip_date" DATE NOT NULL,
    "origin" VARCHAR(255),
    "destination" VARCHAR(255),
    "distance_km" DECIMAL(8,2),
    "cost_paise" BIGINT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport"."vehicles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "registration_number" VARCHAR(50) NOT NULL,
    "driver_name" VARCHAR(255),
    "capacity_details" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers"."profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "alternate_phone" VARCHAR(20),
    "address" TEXT,
    "id_proof_type" VARCHAR(50),
    "id_proof_number" VARCHAR(100),
    "photo_url" TEXT,
    "dob" DATE,
    "gender" VARCHAR(20),
    "emergency_contact_name" VARCHAR(255),
    "emergency_contact_phone" VARCHAR(20),
    "emergency_relationship" VARCHAR(50),
    "payment_type" VARCHAR(50) NOT NULL DEFAULT 'PIECE_RATE',
    "joining_date" DATE NOT NULL,
    "total_decided_advance_amount" BIGINT DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "archived_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers"."rate_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "worker_id" UUID NOT NULL,
    "effective_date" DATE NOT NULL,
    "rate_per_1000_paise" BIGINT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,

    CONSTRAINT "rate_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers"."daily_work_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "worker_id" UUID NOT NULL,
    "work_date" DATE NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "entry_mode" VARCHAR(20) NOT NULL,
    "input_quantity" DECIMAL(10,2) NOT NULL,
    "physical_quantity" DECIMAL(10,2) NOT NULL,
    "billable_quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "conversion_physical_per_unit" INTEGER,
    "conversion_billable_per_unit" INTEGER,
    "rate_paise" BIGINT NOT NULL,
    "earned_amount_paise" BIGINT NOT NULL,
    "aalyawala_id" UUID,
    "bhatkar_id" UUID,
    "batch_id" UUID,
    "log_group_id" UUID,
    "is_primary" BOOLEAN NOT NULL DEFAULT true,
    "is_auto_generated" BOOLEAN NOT NULL DEFAULT false,
    "reference_no" VARCHAR(100),
    "notes" TEXT,
    "settlement_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "created_by" UUID,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),
    "updated_by" UUID,
    "deleted_at" TIMESTAMPTZ(6),
    "deleted_by" UUID,

    CONSTRAINT "daily_work_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers"."work_unit_conversions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "business_unit_id" UUID NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "unit_name" VARCHAR(20) NOT NULL,
    "physical_count_per_unit" INTEGER NOT NULL,
    "billable_count_per_unit" INTEGER NOT NULL,
    "effective_from" DATE NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT clock_timestamp(),

    CONSTRAINT "work_unit_conversions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_audit_events_bu_date" ON "audit"."events"("business_unit_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_events_entity" ON "audit"."events"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "idx_sessions_user_id" ON "app_auth"."sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "app_auth"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "app_auth"."users"("email");

-- CreateIndex
CREATE INDEX "idx_users_business_unit" ON "app_auth"."users"("business_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_brick_grade_code" ON "core"."brick_grades"("business_unit_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_brick_type_code" ON "core"."brick_types"("business_unit_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "business_units_code_key" ON "core"."business_units"("code");

-- CreateIndex
CREATE UNIQUE INDEX "unique_expense_category_code" ON "core"."expense_categories"("business_unit_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "material_units_code_key" ON "core"."material_units"("code");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_code_key" ON "core"."payment_methods"("code");

-- CreateIndex
CREATE INDEX "idx_allocations_charge" ON "finance"."allocations"("charge_id");

-- CreateIndex
CREATE INDEX "idx_allocations_payment" ON "finance"."allocations"("payment_id");

-- CreateIndex
CREATE INDEX "idx_charges_bu_party" ON "finance"."charges"("business_unit_id", "party_type", "party_id");

-- CreateIndex
CREATE INDEX "idx_expenses_bu_date" ON "finance"."expenses"("business_unit_id", "expense_date" DESC);

-- CreateIndex
CREATE INDEX "idx_payments_bu_party" ON "finance"."payments"("business_unit_id", "party_type", "party_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_payment_number" ON "finance"."payments"("business_unit_id", "payment_number");

-- CreateIndex
CREATE INDEX "idx_settlements_worker" ON "finance"."settlements"("worker_id", "period_start_date", "period_end_date");

-- CreateIndex
CREATE UNIQUE INDEX "unique_settlement_number" ON "finance"."settlements"("business_unit_id", "settlement_number");

-- CreateIndex
CREATE INDEX "idx_finished_lots_available" ON "inventory"."finished_lots"("brick_type_id", "brick_grade_id", "available_quantity") WHERE (available_quantity > 0);

-- CreateIndex
CREATE INDEX "idx_stock_ledger_bu_date" ON "inventory"."stock_ledger"("business_unit_id", "transaction_date" DESC);

-- CreateIndex
CREATE INDEX "idx_materials_bu" ON "materials"."catalogue"("business_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_material_code" ON "materials"."catalogue"("business_unit_id", "code");

-- CreateIndex
CREATE INDEX "idx_material_consumption_batch" ON "materials"."consumption"("batch_id");

-- CreateIndex
CREATE INDEX "idx_material_lots_available" ON "materials"."lots"("material_id", "available_quantity") WHERE (available_quantity > (0)::numeric);

-- CreateIndex
CREATE UNIQUE INDEX "unique_purchase_number" ON "materials"."purchases"("business_unit_id", "purchase_number");

-- CreateIndex
CREATE INDEX "idx_customers_bu" ON "parties"."customers"("business_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_customer_code" ON "parties"."customers"("business_unit_id", "code");

-- CreateIndex
CREATE INDEX "idx_suppliers_bu" ON "parties"."suppliers"("business_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_supplier_code" ON "parties"."suppliers"("business_unit_id", "code");

-- CreateIndex
CREATE INDEX "idx_batches_bu" ON "production"."batches"("business_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_batch_number" ON "production"."batches"("business_unit_id", "batch_number");

-- CreateIndex
CREATE INDEX "idx_moulding_logs_batch" ON "production"."daily_moulding_logs"("batch_id");

-- CreateIndex
CREATE INDEX "idx_moulding_logs_worker" ON "production"."daily_moulding_logs"("worker_id", "work_date");

-- CreateIndex
CREATE INDEX "idx_sales_bu_date" ON "sales"."records"("business_unit_id", "sale_date" DESC);

-- CreateIndex
CREATE INDEX "idx_sales_customer" ON "sales"."records"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_sale_number" ON "sales"."records"("business_unit_id", "sale_number");

-- CreateIndex
CREATE UNIQUE INDEX "unique_vehicle_reg" ON "transport"."vehicles"("business_unit_id", "registration_number");

-- CreateIndex
CREATE INDEX "idx_workers_bu" ON "workers"."profiles"("business_unit_id");

-- CreateIndex
CREATE UNIQUE INDEX "unique_worker_code_per_bu" ON "workers"."profiles"("business_unit_id", "code");

-- CreateIndex
CREATE INDEX "idx_worker_rate_lookup" ON "workers"."rate_history"("worker_id", "effective_date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "unique_worker_rate_effective_date" ON "workers"."rate_history"("worker_id", "effective_date");

-- CreateIndex
CREATE INDEX "idx_work_logs_worker_date" ON "workers"."daily_work_logs"("worker_id", "work_date");

-- CreateIndex
CREATE INDEX "idx_work_logs_bu_cat_date" ON "workers"."daily_work_logs"("business_unit_id", "category", "work_date");

-- CreateIndex
CREATE INDEX "idx_work_logs_batch_id" ON "workers"."daily_work_logs"("batch_id");

-- CreateIndex
CREATE INDEX "idx_work_logs_log_group_id" ON "workers"."daily_work_logs"("log_group_id");

-- CreateIndex
CREATE INDEX "idx_work_logs_worker_cat_deleted" ON "workers"."daily_work_logs"("worker_id", "category", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_work_logs_bhatkar_id" ON "workers"."daily_work_logs"("bhatkar_id");

-- CreateIndex
CREATE INDEX "idx_work_logs_aalyawala_id" ON "workers"."daily_work_logs"("aalyawala_id");

-- CreateIndex
CREATE INDEX "work_unit_conversions_business_unit_id_category_unit_name_e_idx" ON "workers"."work_unit_conversions"("business_unit_id", "category", "unit_name", "effective_from");

-- AddForeignKey
ALTER TABLE "audit"."events" ADD CONSTRAINT "events_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "audit"."events" ADD CONSTRAINT "events_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "app_auth"."sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "app_auth"."users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "app_auth"."users" ADD CONSTRAINT "users_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core"."brick_grades" ADD CONSTRAINT "brick_grades_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core"."brick_types" ADD CONSTRAINT "brick_types_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "core"."expense_categories" ADD CONSTRAINT "expense_categories_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."allocations" ADD CONSTRAINT "allocations_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "finance"."charges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."allocations" ADD CONSTRAINT "allocations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."allocations" ADD CONSTRAINT "allocations_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "finance"."payments"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."charges" ADD CONSTRAINT "charges_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."charges" ADD CONSTRAINT "charges_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."expenses" ADD CONSTRAINT "expenses_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production"."batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."expenses" ADD CONSTRAINT "expenses_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."expenses" ADD CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "core"."expense_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."expenses" ADD CONSTRAINT "expenses_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "finance"."charges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."expenses" ADD CONSTRAINT "expenses_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."expenses" ADD CONSTRAINT "expenses_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "core"."payment_methods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."payments" ADD CONSTRAINT "payments_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."payments" ADD CONSTRAINT "payments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."payments" ADD CONSTRAINT "payments_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "core"."payment_methods"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."settlements" ADD CONSTRAINT "settlements_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."settlements" ADD CONSTRAINT "settlements_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."settlements" ADD CONSTRAINT "settlements_charge_id_fkey" FOREIGN KEY ("charge_id") REFERENCES "finance"."charges"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."settlements" ADD CONSTRAINT "settlements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."settlements" ADD CONSTRAINT "settlements_voided_by_fkey" FOREIGN KEY ("voided_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "finance"."settlements" ADD CONSTRAINT "settlements_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."finished_lots" ADD CONSTRAINT "finished_lots_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production"."batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."finished_lots" ADD CONSTRAINT "finished_lots_brick_grade_id_fkey" FOREIGN KEY ("brick_grade_id") REFERENCES "core"."brick_grades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."finished_lots" ADD CONSTRAINT "finished_lots_brick_type_id_fkey" FOREIGN KEY ("brick_type_id") REFERENCES "core"."brick_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."finished_lots" ADD CONSTRAINT "finished_lots_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."stock_adjustments" ADD CONSTRAINT "stock_adjustments_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."stock_adjustments" ADD CONSTRAINT "stock_adjustments_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."stock_adjustments" ADD CONSTRAINT "stock_adjustments_finished_lot_id_fkey" FOREIGN KEY ("finished_lot_id") REFERENCES "inventory"."finished_lots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."stock_ledger" ADD CONSTRAINT "stock_ledger_brick_grade_id_fkey" FOREIGN KEY ("brick_grade_id") REFERENCES "core"."brick_grades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."stock_ledger" ADD CONSTRAINT "stock_ledger_brick_type_id_fkey" FOREIGN KEY ("brick_type_id") REFERENCES "core"."brick_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."stock_ledger" ADD CONSTRAINT "stock_ledger_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."stock_ledger" ADD CONSTRAINT "stock_ledger_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "inventory"."stock_ledger" ADD CONSTRAINT "stock_ledger_finished_lot_id_fkey" FOREIGN KEY ("finished_lot_id") REFERENCES "inventory"."finished_lots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."catalogue" ADD CONSTRAINT "catalogue_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."catalogue" ADD CONSTRAINT "catalogue_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "core"."material_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."consumption" ADD CONSTRAINT "consumption_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production"."batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."consumption" ADD CONSTRAINT "consumption_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."consumption" ADD CONSTRAINT "consumption_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."consumption" ADD CONSTRAINT "consumption_material_lot_id_fkey" FOREIGN KEY ("material_lot_id") REFERENCES "materials"."lots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."lots" ADD CONSTRAINT "lots_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."lots" ADD CONSTRAINT "lots_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"."catalogue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."lots" ADD CONSTRAINT "lots_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "materials"."purchases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."purchases" ADD CONSTRAINT "purchases_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."purchases" ADD CONSTRAINT "purchases_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."purchases" ADD CONSTRAINT "purchases_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"."catalogue"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "materials"."purchases" ADD CONSTRAINT "purchases_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "parties"."suppliers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parties"."customers" ADD CONSTRAINT "customers_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "parties"."suppliers" ADD CONSTRAINT "suppliers_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production"."batches" ADD CONSTRAINT "batches_brick_type_id_fkey" FOREIGN KEY ("brick_type_id") REFERENCES "core"."brick_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production"."batches" ADD CONSTRAINT "batches_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production"."batches" ADD CONSTRAINT "batches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production"."daily_moulding_logs" ADD CONSTRAINT "daily_moulding_logs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production"."batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production"."daily_moulding_logs" ADD CONSTRAINT "daily_moulding_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production"."daily_moulding_logs" ADD CONSTRAINT "daily_moulding_logs_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"."profiles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production"."daily_moulding_logs" ADD CONSTRAINT "fk_daily_moulding_settlement" FOREIGN KEY ("settlement_id") REFERENCES "finance"."settlements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production"."stage_transitions" ADD CONSTRAINT "stage_transitions_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production"."batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "production"."stage_transitions" ADD CONSTRAINT "stage_transitions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales"."records" ADD CONSTRAINT "records_brick_grade_id_fkey" FOREIGN KEY ("brick_grade_id") REFERENCES "core"."brick_grades"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales"."records" ADD CONSTRAINT "records_brick_type_id_fkey" FOREIGN KEY ("brick_type_id") REFERENCES "core"."brick_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales"."records" ADD CONSTRAINT "records_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales"."records" ADD CONSTRAINT "records_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales"."records" ADD CONSTRAINT "records_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "parties"."customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales"."records" ADD CONSTRAINT "records_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "transport"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales"."stock_allocations" ADD CONSTRAINT "stock_allocations_finished_lot_id_fkey" FOREIGN KEY ("finished_lot_id") REFERENCES "inventory"."finished_lots"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "sales"."stock_allocations" ADD CONSTRAINT "stock_allocations_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"."records"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transport"."trips" ADD CONSTRAINT "trips_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production"."batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transport"."trips" ADD CONSTRAINT "trips_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transport"."trips" ADD CONSTRAINT "trips_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transport"."trips" ADD CONSTRAINT "trips_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"."records"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transport"."trips" ADD CONSTRAINT "trips_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "transport"."vehicles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "transport"."vehicles" ADD CONSTRAINT "vehicles_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workers"."profiles" ADD CONSTRAINT "profiles_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workers"."rate_history" ADD CONSTRAINT "rate_history_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workers"."rate_history" ADD CONSTRAINT "rate_history_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"."profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workers"."daily_work_logs" ADD CONSTRAINT "daily_work_logs_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "workers"."profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workers"."daily_work_logs" ADD CONSTRAINT "daily_work_logs_aalyawala_id_fkey" FOREIGN KEY ("aalyawala_id") REFERENCES "workers"."profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workers"."daily_work_logs" ADD CONSTRAINT "daily_work_logs_bhatkar_id_fkey" FOREIGN KEY ("bhatkar_id") REFERENCES "workers"."profiles"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workers"."daily_work_logs" ADD CONSTRAINT "daily_work_logs_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workers"."daily_work_logs" ADD CONSTRAINT "daily_work_logs_settlement_id_fkey" FOREIGN KEY ("settlement_id") REFERENCES "finance"."settlements"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workers"."daily_work_logs" ADD CONSTRAINT "daily_work_logs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production"."batches"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workers"."daily_work_logs" ADD CONSTRAINT "daily_work_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "app_auth"."users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "workers"."work_unit_conversions" ADD CONSTRAINT "work_unit_conversions_business_unit_id_fkey" FOREIGN KEY ("business_unit_id") REFERENCES "core"."business_units"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
