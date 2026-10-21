# Security threat model — initial public RFQ MVP

This is an initial design review, not an independent security audit or production security certification.

## Assets and trust boundaries

| Asset | Sensitivity | Boundary |
|---|---|---|
| RFQ customer/company/contact data | Personal/business-confidential | Public browser → API → private PostgreSQL |
| RFQ status and internal follow-up | Internal | Authenticated future CRM only; not exposed by public API |
| Partner/supplier buy rates, margin and quote terms | Highly confidential | Not present in MVP public API; future restricted roles |
| Documents and certificates | Sensitive | No upload accepted yet; future private object storage only |
| Secrets (DB, HMAC, email, n8n) | Critical | Runtime secret store only; `.env.example` contains placeholders |
| Outbox payloads and automation runs | Internal | DB/worker/n8n service identity; never public |

## Scenarios and controls

| Scenario | MVP controls | Residual / future control |
|---|---|---|
| Spam, brute-force form abuse or oversized payload | 24 KiB cap, Postgres fixed-window limit, max five attempts per client/window, HMAC-derived bucket key, `Retry-After`, honeypot. | CAPTCHA/WAF may be needed after measured abuse; validate trusted-proxy address headers and egress. Rate buckets need retention/cleanup monitoring. |
| Spoofed client IP via forwarded headers | Code comment and runbook require a trusted ingress that overwrites headers. | Do not expose app directly; test the actual hosting proxy before release. Consider provider-native edge controls. |
| Cross-site submission | Reject mismatched `Origin` when present; JSON content type. | Verify reverse-proxy origin handling. Add CSRF token if a future authenticated state-changing route uses cookies. |
| Invalid values / injection / XSS | Zod server-side schema; Prisma parameterized operations; escaped React output; no client DB access. | Internal content must remain escaped; validate every future endpoint independently. Review rich-text CMS sanitization. |
| Duplicate identities or race conditions | Normalized composite unique company key, unique normalized email, DB upsert, unique reference/idempotency constraints. | False positive/merge workflow and concurrency integration tests required. |
| Lost integration notification | RFQ, initial history and outbox event committed in one transaction. | Dispatcher, retry, lease/claim, backoff, dead letter and owner alert are not implemented yet. |
| Privacy notice not approved | API fails closed unless `PRIVACY_NOTICE_APPROVED=true`; consent timestamp persisted. | Flag is an operational safeguard, not a legal assessment. Publish complete notice, define retention/DSAR and configure logs/backups before enabling. |
| Unsafe file upload | No file-upload endpoint or form control; UI warns not to send sensitive documents yet. | Future private object storage; extension/MIME/signature/size checks; malware scanning; authorization; retention and audit. |
| Unauthorized CRM access | No CRM/admin routes or public read APIs exist. | Auth.js or maintained secure auth, MFA/SSO decision, server-side RBAC, tenant/scope checks, session rotation and authorization tests before CRM. |
| Public leakage of rates/margins/agent history | These fields are absent from public response and MVP schema. | Explicit allowlist DTOs and API contract tests; separate access roles in future operations. |
| Compromised automation webhook | No webhook enabled. | Signed request/HMAC or service auth, timestamp/replay protection, idempotency, allowlisted event schemas, secret rotation and least privilege. |
| Operational loss / ransomware | Local Docker volume only for development. | Managed backups, encryption, restore drills, RPO/RTO, retention and incident response remain launch blockers. |

## Security acceptance before production

1. Reconcile source documents and approve the service/data boundary.
2. Owner/legal review and publication of privacy notice, terms and disclaimers.
3. Configure owner-managed TLS, trusted ingress, host/origin allowlist and rate limiting.
4. Use a least-privilege database role; isolate dev/stage/prod; rotate secrets.
5. Add security headers/CSP after evaluating Next/Image and deployment behavior.
6. Run dependency/license and vulnerability scans; fix critical/high findings.
7. Verify logs redact request bodies, PII and secrets; define retention and alert ownership.
8. Test validation, idempotency, rate limit, access boundaries and database restore.
9. For private CRM, complete RBAC/authentication threat review before exposing data.
