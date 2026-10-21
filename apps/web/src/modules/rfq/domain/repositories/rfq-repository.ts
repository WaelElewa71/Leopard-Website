import type { RfqSubmission } from "../entities/rfq-request";
import type { RfqStatus } from "../entities/rfq";

export type CreateRfqRecord = RfqSubmission & {
  reference: string;
  idempotencyKey?: string;
};

export type CreatedRfq = {
  id: string;
  reference: string;
  status: RfqStatus;
  createdAt: Date;
};

export interface RfqRepository {
  create(record: CreateRfqRecord): Promise<CreatedRfq>;
}
