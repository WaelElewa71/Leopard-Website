import { getPrismaClient } from "@leopard/database";
import type {
  CreatedRfq,
  CreateRfqRecord,
  RfqRepository,
} from "../domain/repositories/rfq-repository";
import {
  normalizeCompanyIdentity,
  normalizeContactEmail,
} from "../domain/value-objects/company-identity";

function optionalValue(value: string | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

function toCreatedRfq(record: {
  id: string;
  reference: string;
  status: CreatedRfq["status"];
  createdAt: Date;
}): CreatedRfq {
  return {
    id: record.id,
    reference: record.reference,
    status: record.status,
    createdAt: record.createdAt,
  };
}

export class PrismaRfqRepository implements RfqRepository {
  async create(record: CreateRfqRecord): Promise<CreatedRfq> {
    const prisma = getPrismaClient();
    const normalizedCompanyName = normalizeCompanyIdentity(record.companyName);
    const normalizedCountry = normalizeCompanyIdentity(record.companyCountry);
    const normalizedEmail = normalizeContactEmail(record.email);

    try {
      return await prisma.$transaction(async (transaction) => {
        if (record.idempotencyKey) {
          const existing = await transaction.rfq.findUnique({
            where: { idempotencyKey: record.idempotencyKey },
          });
          if (existing) return toCreatedRfq(existing);
        }

        const company = await transaction.masterCompany.upsert({
          where: {
            normalizedName_countryNormalized: {
              normalizedName: normalizedCompanyName,
              countryNormalized: normalizedCountry,
            },
          },
          update: {},
          create: {
            legalName: record.companyName.trim(),
            normalizedName: normalizedCompanyName,
            country: record.companyCountry.trim(),
            countryNormalized: normalizedCountry,
          },
        });

        const contact = await transaction.contact.upsert({
          where: { emailNormalized: normalizedEmail },
          update: {},
          create: {
            fullName: record.contactName.trim(),
            email: record.email.trim(),
            emailNormalized: normalizedEmail,
            phone: record.phone.trim(),
          },
        });

        await transaction.companyContact.upsert({
          where: { companyId_contactId: { companyId: company.id, contactId: contact.id } },
          update: {},
          create: { companyId: company.id, contactId: contact.id },
        });

        const rfq = await transaction.rfq.create({
          data: {
            reference: record.reference,
            direction: record.direction,
            mode: record.mode,
            loadType: record.mode === "SEA" ? record.loadType : "NOT_APPLICABLE",
            companyId: company.id,
            contactId: contact.id,
            preferredContactMethod: record.preferredContactMethod,
            originCountry: record.originCountry.trim(),
            originLocation: record.originLocation.trim(),
            originPort: optionalValue(record.originPort),
            destinationCountry: record.destinationCountry.trim(),
            destinationLocation: record.destinationLocation.trim(),
            destinationPort: optionalValue(record.destinationPort),
            incoterm: record.incoterm,
            cargoReadyAt: record.cargoReadyDate
              ? new Date(`${record.cargoReadyDate}T00:00:00.000Z`)
              : null,
            additionalInstructions: optionalValue(record.additionalInstructions),
            privacyConsentAt: new Date(),
            source: record.source,
            idempotencyKey: record.idempotencyKey,
            cargoItems: {
              create: [
                {
                  description: record.cargoDescription.trim(),
                  commodity: optionalValue(record.commodity),
                  hsCode: optionalValue(record.hsCode),
                  grossWeightKg: record.grossWeightKg,
                  volumeCbm: record.volumeCbm ?? null,
                  lengthCm: record.lengthCm ?? null,
                  widthCm: record.widthCm ?? null,
                  heightCm: record.heightCm ?? null,
                  packageCount: record.packageCount,
                  packageType: record.packageType.trim(),
                  containerType:
                    record.mode === "SEA" && record.loadType === "FCL"
                      ? optionalValue(record.containerType)
                      : null,
                  dangerousGoods: record.dangerousGoods,
                  temperatureControl: record.temperatureControl,
                },
              ],
            },
            statusHistory: {
              create: [{ fromStatus: null, toStatus: "NEW", note: "Website RFQ submitted" }],
            },
          },
        });

        await transaction.outboxEvent.create({
          data: {
            eventType: "rfq.created",
            aggregateType: "RFQ",
            aggregateId: rfq.id,
            idempotencyKey: `rfq.created:${rfq.id}`,
            payload: {
              rfqId: rfq.id,
              reference: rfq.reference,
              source: record.source,
            },
          },
        });

        return toCreatedRfq(rfq);
      });
    } catch (error) {
      if (record.idempotencyKey && isUniqueConstraintError(error)) {
        const existing = await prisma.rfq.findUnique({
          where: { idempotencyKey: record.idempotencyKey },
        });
        if (existing) return toCreatedRfq(existing);
      }
      throw error;
    }
  }
}
