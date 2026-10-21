import { describe, expect, it } from "vitest";
import { canTransitionRfq } from "../src/modules/rfq/domain/entities/rfq";

describe("RFQ state transitions", () => {
  it("allows the controlled draft, approval, and send sequence", () => {
    expect(canTransitionRfq("DRAFT_QUOTE", "AWAITING_APPROVAL")).toBe(true);
    expect(canTransitionRfq("AWAITING_APPROVAL", "APPROVED")).toBe(true);
    expect(canTransitionRfq("APPROVED", "SENT")).toBe(true);
  });

  it("does not allow a draft quote to be sent without approval", () => {
    expect(canTransitionRfq("DRAFT_QUOTE", "SENT")).toBe(false);
    expect(canTransitionRfq("AWAITING_APPROVAL", "SENT")).toBe(false);
  });

  it("keeps terminal outcomes closed", () => {
    expect(canTransitionRfq("WON", "SOURCING")).toBe(false);
    expect(canTransitionRfq("LOST", "DRAFT_QUOTE")).toBe(false);
    expect(canTransitionRfq("EXPIRED", "SENT")).toBe(false);
  });
});
