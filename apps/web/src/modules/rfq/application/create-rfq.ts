import type { CreatedRfq, RfqRepository } from "../domain/repositories/rfq-repository";
import type { RfqSubmission } from "../domain/entities/rfq-request";

export type CreateRfqDependencies = {
  repository: RfqRepository;
  createReference: () => string;
};

export async function createRfq(
  request: RfqSubmission,
  dependencies: CreateRfqDependencies,
  idempotencyKey?: string,
): Promise<CreatedRfq> {
  return dependencies.repository.create({
    ...request,
    reference: dependencies.createReference(),
    idempotencyKey,
  });
}
