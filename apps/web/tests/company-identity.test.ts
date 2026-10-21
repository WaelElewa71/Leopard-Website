import { describe, expect, it } from "vitest";
import {
  normalizeCompanyIdentity,
  normalizeContactEmail,
} from "../src/modules/rfq/domain/value-objects/company-identity";

describe("identity normalization", () => {
  it("normalizes compatibility characters and repeated whitespace for company matching", () => {
    expect(normalizeCompanyIdentity("  ACME   Trading  ")).toBe("acme trading");
    expect(normalizeCompanyIdentity("ＡＣＭＥ Trading")).toBe("acme trading");
  });

  it("normalizes contact email without changing the original display value", () => {
    expect(normalizeContactEmail("  Sales@Example.Test ")).toBe("sales@example.test");
  });
});
