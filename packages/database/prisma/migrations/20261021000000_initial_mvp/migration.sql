-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "RfqStatus" AS ENUM ('NEW', 'DATA_VALIDATION', 'DATA_MISSING', 'READY_FOR_SOURCING', 'SOURCING', 'RATES_RECEIVED', 'DRAFT_QUOTE', 'AWAITING_APPROVAL', 'APPROVED', 'SENT', 'NEGOTIATION', 'WON', 'LOST', 'EXPIRED');

-- CreateEnum
CREATE TYPE "TransportMode" AS ENUM ('SEA', 'AIR', 'LAND');

-- CreateEnum
CREATE TYPE "ShipmentDirection" AS ENUM ('IMPORT', 'EXPORT', 'CROSS_TRADE');

-- CreateEnum
CREATE TYPE "PreferredContactMethod" AS ENUM ('EMAIL', 'PHONE', 'WHATSAPP');

-- CreateEnum
CREATE TYPE "LoadType" AS ENUM ('FCL', 'LCL', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "master_companies" (
    "id" UUID NOT NULL,
    "legalName" VARCHAR(180) NOT NULL,
    "normalizedName" VARCHAR(180) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "countryNormalized" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "master_companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "fullName" VARCHAR(140) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "emailNormalized" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(40) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_contacts" (
    "companyId" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "roleTitle" VARCHAR(100),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "company_contacts_pkey" PRIMARY KEY ("companyId","contactId")
);

-- CreateTable
CREATE TABLE "rfqs" (
    "id" UUID NOT NULL,
    "reference" VARCHAR(32) NOT NULL,
    "status" "RfqStatus" NOT NULL DEFAULT 'NEW',
    "direction" "ShipmentDirection" NOT NULL,
    "mode" "TransportMode" NOT NULL,
    "loadType" "LoadType" NOT NULL DEFAULT 'NOT_APPLICABLE',
    "companyId" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "preferredContactMethod" "PreferredContactMethod" NOT NULL,
    "originCountry" VARCHAR(100) NOT NULL,
    "originLocation" VARCHAR(140) NOT NULL,
    "originPort" VARCHAR(140),
    "destinationCountry" VARCHAR(100) NOT NULL,
    "destinationLocation" VARCHAR(140) NOT NULL,
    "destinationPort" VARCHAR(140),
    "incoterm" VARCHAR(8) NOT NULL,
    "cargoReadyAt" DATE,
    "additionalInstructions" TEXT,
    "privacyConsentAt" TIMESTAMPTZ(3) NOT NULL,
    "source" VARCHAR(40) NOT NULL DEFAULT 'website',
    "idempotencyKey" VARCHAR(80),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "rfqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cargo_items" (
    "id" UUID NOT NULL,
    "rfqId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "commodity" VARCHAR(140),
    "hsCode" VARCHAR(20),
    "grossWeightKg" DECIMAL(12,3) NOT NULL,
    "volumeCbm" DECIMAL(12,4),
    "lengthCm" DECIMAL(10,2),
    "widthCm" DECIMAL(10,2),
    "heightCm" DECIMAL(10,2),
    "packageCount" INTEGER NOT NULL,
    "packageType" VARCHAR(80) NOT NULL,
    "containerType" VARCHAR(40),
    "dangerousGoods" BOOLEAN NOT NULL DEFAULT false,
    "temperatureControl" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cargo_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rfq_status_history" (
    "id" UUID NOT NULL,
    "rfqId" UUID NOT NULL,
    "fromStatus" "RfqStatus",
    "toStatus" "RfqStatus" NOT NULL,
    "note" VARCHAR(500),
    "changedById" UUID,
    "changedAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rfq_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" UUID NOT NULL,
    "eventType" VARCHAR(100) NOT NULL,
    "aggregateType" VARCHAR(80) NOT NULL,
    "aggregateId" UUID NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "idempotencyKey" VARCHAR(160) NOT NULL,
    "availableAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMPTZ(3),
    "lastError" VARCHAR(1000),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rate_limit_buckets" (
    "key" VARCHAR(80) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "rate_limit_buckets_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "master_companies_countryNormalized_idx" ON "master_companies"("countryNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "master_company_identity_key" ON "master_companies"("normalizedName", "countryNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "contacts_email_normalized_key" ON "contacts"("emailNormalized");

-- CreateIndex
CREATE INDEX "contacts_fullName_idx" ON "contacts"("fullName");

-- CreateIndex
CREATE INDEX "company_contacts_contactId_idx" ON "company_contacts"("contactId");

-- CreateIndex
CREATE UNIQUE INDEX "rfqs_reference_key" ON "rfqs"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "rfqs_idempotency_key_key" ON "rfqs"("idempotencyKey");

-- CreateIndex
CREATE INDEX "rfqs_status_createdAt_idx" ON "rfqs"("status", "createdAt");

-- CreateIndex
CREATE INDEX "rfqs_companyId_createdAt_idx" ON "rfqs"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "rfqs_contactId_createdAt_idx" ON "rfqs"("contactId", "createdAt");

-- CreateIndex
CREATE INDEX "rfqs_originCountry_destinationCountry_idx" ON "rfqs"("originCountry", "destinationCountry");

-- CreateIndex
CREATE INDEX "cargo_items_rfqId_idx" ON "cargo_items"("rfqId");

-- CreateIndex
CREATE INDEX "rfq_status_history_rfqId_changedAt_idx" ON "rfq_status_history"("rfqId", "changedAt");

-- CreateIndex
CREATE UNIQUE INDEX "outbox_events_idempotency_key_key" ON "outbox_events"("idempotencyKey");

-- CreateIndex
CREATE INDEX "outbox_events_status_availableAt_idx" ON "outbox_events"("status", "availableAt");

-- CreateIndex
CREATE INDEX "outbox_events_aggregateType_aggregateId_idx" ON "outbox_events"("aggregateType", "aggregateId");

-- CreateIndex
CREATE INDEX "rate_limit_buckets_expiresAt_idx" ON "rate_limit_buckets"("expiresAt");

-- AddForeignKey
ALTER TABLE "company_contacts" ADD CONSTRAINT "company_contacts_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "master_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_contacts" ADD CONSTRAINT "company_contacts_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "master_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfqs" ADD CONSTRAINT "rfqs_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cargo_items" ADD CONSTRAINT "cargo_items_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rfq_status_history" ADD CONSTRAINT "rfq_status_history_rfqId_fkey" FOREIGN KEY ("rfqId") REFERENCES "rfqs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
