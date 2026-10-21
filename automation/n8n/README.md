# n8n workflow repository boundary

No workflow is active or exported yet. n8n is an orchestration layer only; Leopard PostgreSQL remains the source of truth.

Planned first workflow (after owner approval): receive a signed, idempotent `rfq.created` outbox event → validate allowlisted schema → create a Leopard task/notification → acknowledge delivery. Do not store a duplicate master company/customer record in n8n.

Future workflows must include bounded retries, dead-letter handling, failure alerts, execution/audit correlation IDs and explicit human approval for all pricing, financial/legal commitments and publication. Agent follow-ups must stop on meaningful reply, unsubscribe, invalid address, delivery failure or do-not-contact state.
