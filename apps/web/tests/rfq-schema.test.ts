import { describe, expect, it } from "vitest";
import { rfqRequestSchema } from "../src/modules/rfq/presentation/schemas/rfq-schema";

const validRequest = {
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
  cargoDescription: "Bagged agricultural product",
  commodity: "Feed ingredient",
  grossWeightKg: 1200,
  packageCount: 24,
  packageType: "Bags",
  incoterm: "FOB",
  originPort: "Alexandria",
  destinationPort: "Genoa",
  volumeCbm: 7.5,
  lengthCm: undefined,
  widthCm: undefined,
  heightCm: undefined,
  hsCode: "123456",
  cargoReadyDate: "",
  dangerousGoods: false,
  temperatureControl: false,
  additionalInstructions: "",
  privacyConsent: true,
  website: "",
} as const;

describe("freight RFQ validation", () => {
  it("accepts a structurally complete sea LCL request", () => {
    expect(rfqRequestSchema.safeParse(validRequest).success).toBe(true);
  });

  it("requires a sea load type", () => {
    const parsed = rfqRequestSchema.safeParse({ ...validRequest, loadType: "NOT_APPLICABLE" });
    expect(parsed.success).toBe(false);
    if (!parsed.success)
      expect(parsed.error.issues.some((issue) => issue.message === "seaLoadType")).toBe(true);
  });

  it("requires container details for FCL", () => {
    const parsed = rfqRequestSchema.safeParse({
      ...validRequest,
      loadType: "FCL",
      containerType: "",
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success)
      expect(parsed.error.issues.some((issue) => issue.message === "fclContainer")).toBe(true);
  });

  it("requires air CBM or all three dimensions", () => {
    const parsed = rfqRequestSchema.safeParse({
      ...validRequest,
      mode: "AIR",
      loadType: "NOT_APPLICABLE",
      volumeCbm: undefined,
    });
    expect(parsed.success).toBe(false);
    if (!parsed.success)
      expect(parsed.error.issues.some((issue) => issue.message === "airDimensions")).toBe(true);
  });

  it("preserves the allowlisted Feed Hub origin tag", () => {
    const parsed = rfqRequestSchema.safeParse({ ...validRequest, source: "feed-hub" });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.source).toBe("feed-hub");
  });

  it("does not accept the request without privacy consent", () => {
    const parsed = rfqRequestSchema.safeParse({ ...validRequest, privacyConsent: false });
    expect(parsed.success).toBe(false);
    if (!parsed.success)
      expect(parsed.error.issues.some((issue) => issue.message === "consent")).toBe(true);
  });
});
