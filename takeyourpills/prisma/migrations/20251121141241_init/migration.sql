-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "external_id" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'UTC',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "cron_expression" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumption_history" (
    "id" TEXT NOT NULL,
    "medication_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "scheduled_time" TIMESTAMP(3) NOT NULL,
    "consumed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consumption_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_external_id_key" ON "users"("external_id");

-- CreateIndex
CREATE INDEX "users_external_id_idx" ON "users"("external_id");

-- CreateIndex
CREATE INDEX "medications_user_id_idx" ON "medications"("user_id");

-- CreateIndex
CREATE INDEX "medications_user_id_created_at_idx" ON "medications"("user_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "medications_user_id_name_key" ON "medications"("user_id", "name");

-- CreateIndex
CREATE INDEX "consumption_history_user_id_idx" ON "consumption_history"("user_id");

-- CreateIndex
CREATE INDEX "consumption_history_medication_id_idx" ON "consumption_history"("medication_id");

-- CreateIndex
CREATE INDEX "consumption_history_scheduled_time_idx" ON "consumption_history"("scheduled_time");

-- CreateIndex
CREATE INDEX "consumption_history_user_id_scheduled_time_idx" ON "consumption_history"("user_id", "scheduled_time");

-- CreateIndex
CREATE UNIQUE INDEX "consumption_history_medication_id_scheduled_time_key" ON "consumption_history"("medication_id", "scheduled_time");

-- AddForeignKey
ALTER TABLE "medications" ADD CONSTRAINT "medications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumption_history" ADD CONSTRAINT "consumption_history_medication_id_fkey" FOREIGN KEY ("medication_id") REFERENCES "medications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumption_history" ADD CONSTRAINT "consumption_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
