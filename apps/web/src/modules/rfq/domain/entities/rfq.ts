export const RFQ_STATUSES = [
  "NEW",
  "DATA_VALIDATION",
  "DATA_MISSING",
  "READY_FOR_SOURCING",
  "SOURCING",
  "RATES_RECEIVED",
  "DRAFT_QUOTE",
  "AWAITING_APPROVAL",
  "APPROVED",
  "SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
  "EXPIRED",
] as const;

export type RfqStatus = (typeof RFQ_STATUSES)[number];

const allowedTransitions: Record<RfqStatus, readonly RfqStatus[]> = {
  NEW: ["DATA_VALIDATION"],
  DATA_VALIDATION: ["DATA_MISSING", "READY_FOR_SOURCING"],
  DATA_MISSING: ["DATA_VALIDATION"],
  READY_FOR_SOURCING: ["SOURCING"],
  SOURCING: ["DATA_MISSING", "RATES_RECEIVED"],
  RATES_RECEIVED: ["DRAFT_QUOTE"],
  DRAFT_QUOTE: ["AWAITING_APPROVAL"],
  AWAITING_APPROVAL: ["DRAFT_QUOTE", "APPROVED"],
  APPROVED: ["SENT"],
  SENT: ["NEGOTIATION", "WON", "LOST", "EXPIRED"],
  NEGOTIATION: ["AWAITING_APPROVAL", "WON", "LOST", "EXPIRED"],
  WON: [],
  LOST: [],
  EXPIRED: [],
};

export function canTransitionRfq(from: RfqStatus, to: RfqStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertRfqTransition(from: RfqStatus, to: RfqStatus): void {
  if (!canTransitionRfq(from, to)) {
    throw new Error(`Invalid RFQ status transition: ${from} -> ${to}`);
  }
}
