import { z } from "zod";

const shortText = (minimum = 2, maximum = 140) =>
  z.string().trim().min(minimum, "required").max(maximum, "required");

const optionalText = (maximum = 140) =>
  z.string().trim().max(maximum, "required").optional().or(z.literal(""));

const optionalPositiveNumber = z.number().finite().positive("positive").optional();

export const rfqContactSchema = z.object({
  companyName: shortText(2, 180),
  contactName: shortText(2, 140),
  email: z.string().trim().email("email").max(254, "email"),
  phone: z.string().trim().min(7, "required").max(40, "required"),
  companyCountry: shortText(2, 100),
  preferredContactMethod: z.enum(["EMAIL", "PHONE", "WHATSAPP"]),
});

const rfqRouteFields = {
  direction: z.enum(["IMPORT", "EXPORT", "CROSS_TRADE"]),
  mode: z.enum(["SEA", "AIR", "LAND"]),
  originCountry: shortText(2, 100),
  originLocation: shortText(2, 140),
  destinationCountry: shortText(2, 100),
  destinationLocation: shortText(2, 140),
  loadType: z.enum(["FCL", "LCL", "NOT_APPLICABLE"]),
  containerType: optionalText(40),
  cargoDescription: shortText(5, 2000),
  commodity: optionalText(140),
  grossWeightKg: z.number().finite().positive("positive"),
  packageCount: z.number().int("integer").positive("positive"),
  packageType: shortText(1, 80),
  incoterm: z.enum(["EXW", "FCA", "CPT", "CIP", "DAP", "DPU", "DDP", "FAS", "FOB", "CFR", "CIF"]),
};

const rfqDetailsFields = {
  originPort: optionalText(140),
  destinationPort: optionalText(140),
  hsCode: optionalText(20),
  volumeCbm: optionalPositiveNumber,
  lengthCm: optionalPositiveNumber,
  widthCm: optionalPositiveNumber,
  heightCm: optionalPositiveNumber,
  cargoReadyDate: z.string().optional().or(z.literal("")),
  dangerousGoods: z.boolean(),
  temperatureControl: z.boolean(),
  additionalInstructions: z.string().trim().max(2000, "required").optional().or(z.literal("")),
  privacyConsent: z.boolean().refine((value) => value, { message: "consent" }),
  website: z.string().optional(),
};

function addRouteIssues(
  value: { mode: string; loadType: string; containerType?: string },
  context: z.RefinementCtx,
) {
  if (value.mode === "SEA" && value.loadType === "NOT_APPLICABLE") {
    context.addIssue({ code: "custom", path: ["loadType"], message: "seaLoadType" });
  }
  if (value.mode === "SEA" && value.loadType === "FCL" && !value.containerType) {
    context.addIssue({ code: "custom", path: ["containerType"], message: "fclContainer" });
  }
}

function addDetailIssues(
  value: {
    mode: string;
    volumeCbm?: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    cargoReadyDate?: string;
  },
  context: z.RefinementCtx,
) {
  const hasAllDimensions = Boolean(value.lengthCm && value.widthCm && value.heightCm);
  if (value.mode === "AIR" && !value.volumeCbm && !hasAllDimensions) {
    context.addIssue({ code: "custom", path: ["volumeCbm"], message: "airDimensions" });
  }
  if (value.cargoReadyDate && !/^\d{4}-\d{2}-\d{2}$/.test(value.cargoReadyDate)) {
    context.addIssue({ code: "custom", path: ["cargoReadyDate"], message: "required" });
  }
}

export const rfqRouteSchema = z.object(rfqRouteFields).superRefine(addRouteIssues);

export const rfqDetailsSchema = z
  .object({
    mode: z.enum(["SEA", "AIR", "LAND"]),
    ...rfqDetailsFields,
  })
  .superRefine(addDetailIssues);

export const rfqRequestSchema = z
  .object({
    ...rfqContactSchema.shape,
    ...rfqRouteFields,
    ...rfqDetailsFields,
    source: z.enum(["website", "feed-hub"]).optional(),
  })
  .superRefine((value, context) => {
    addRouteIssues(value, context);
    addDetailIssues(value, context);
  });

export type RfqContactInput = z.infer<typeof rfqContactSchema>;
export type RfqRouteInput = z.infer<typeof rfqRouteSchema>;
export type RfqDetailsInput = z.infer<typeof rfqDetailsSchema>;
export type RfqRequest = z.infer<typeof rfqRequestSchema>;
