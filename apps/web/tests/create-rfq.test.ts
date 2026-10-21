import { describe, expect, it, vi } from "vitest";
import { createRfq } from "../src/modules/rfq/application/create-rfq";
import type { RfqSubmission } from "../src/modules/rfq/domain/entities/rfq-request";
import type { RfqRepository } from "../src/modules/rfq/domain/repositories/rfq-repository";

const submission: RfqSubmission = {
  companyName: "Example Trading",
  contactName: "Amina Hassan",
  email: "amina@example.test",
  phone: "+201000000000",
  companyCountry: "Egypt",
  preferredContactMethod: "EMAIL",
  direction: "EXPORT",
  mode: "SEA",
  originCountry: "Egypt",
  originLocation: "Alexandria",
  destinationCountry: "Italy",
  destinationLocation: "Genoa",
  loadType: "LCL",
  containerType: "",
  cargoDescription: "Bagged cargo",
  commodity: "Feed product",
  grossWeightKg: 1200,
  packageCount: 24,
  packageType: "Bags",
  incoterm: "FOB",
  originPort: "Alexandria",
  destinationPort: "Genoa",
  hsCode: "123456",
  volumeCbm: 7.5,
  lengthCm: undefined,
  widthCm: undefined,
  heightCm: undefined,
  cargoReadyDate: "",
  dangerousGoods: false,
  temperatureControl: false,
  additionalInstructions: "",
  privacyConsent: true,
  source: "website",
};

describe("create RFQ use case", () => {
  it("creates a reference and delegates persistence through the repository port", async () => {
    const create = vi.fn(async (record: Parameters<RfqRepository["create"]>[0]) => ({
      id: "rfq-1",
      reference: record.reference,
      status: "NEW" as const,
      createdAt: new Date("2026-10-21T00:00:00.000Z"),
    }));
    const repository: RfqRepository = { create };
    const result = await createRfq(
      submission,
      { repository, createReference: () => "LPS-2026-ABCD" },
      "request-key-1",
    );

    expect(result.reference).toBe("LPS-2026-ABCD");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ reference: "LPS-2026-ABCD", idempotencyKey: "request-key-1" }),
    );
  });
});
