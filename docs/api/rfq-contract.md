# API contract — public freight RFQ intake

**Version:** `/api/v1/rfqs`  
**Status:** Scaffolded; no live database/provider is configured. Endpoint fails closed until required configuration and privacy approval exist.

## POST `/api/v1/rfqs`

Creates one Leopard RFQ and a transactional `rfq.created` outbox event. This is a lead/request intake endpoint, not a booking or pricing endpoint.

### Required server configuration

- `DATABASE_URL`: owner-managed PostgreSQL connection.
- `RATE_LIMIT_HMAC_SECRET`: random secret of at least 32 characters.
- `PRIVACY_NOTICE_APPROVED=true`: set only after owner and qualified legal review approve/publish the relevant notice.
- Trusted ingress that overwrites client IP forwarding headers and provides a stable host/origin context.

If any condition is missing, the route returns `503`; it does not silently queue in memory or pretend the inquiry was received.

### Request headers

```http
Content-Type: application/json
Origin: https://<same-owner-domain>
Idempotency-Key: <8-80 characters, letters/numbers/._:->
```

The idempotency key is optional. Browsers generate a fresh UUID per intentional submission and reuse it only for a retry of the same submission.

### Request body

```json
{
  "companyName": "Customer company",
  "contactName": "Contact person",
  "email": "contact@example.test",
  "phone": "+201000000000",
  "companyCountry": "Egypt",
  "preferredContactMethod": "EMAIL",
  "direction": "EXPORT",
  "mode": "SEA",
  "originCountry": "Egypt",
  "originLocation": "Alexandria",
  "originPort": "Alexandria (if known)",
  "destinationCountry": "Italy",
  "destinationLocation": "Genoa",
  "destinationPort": "Genoa (if known)",
  "loadType": "LCL",
  "containerType": "",
  "cargoDescription": "Description supplied by the customer",
  "commodity": "Optional commodity",
  "hsCode": "Optional HS code",
  "grossWeightKg": 1200,
  "packageCount": 24,
  "packageType": "Bags",
  "volumeCbm": 7.5,
  "lengthCm": 0,
  "widthCm": 0,
  "heightCm": 0,
  "incoterm": "FOB",
  "cargoReadyDate": "2026-11-01",
  "dangerousGoods": false,
  "temperatureControl": false,
  "additionalInstructions": "Optional instructions",
  "privacyConsent": true,
  "source": "website",
  "website": ""
}
```

The example is schema illustration only; values are not live customer or business data. Optional numeric values may be omitted instead of sent as zero. The current form accepts no file fields. `source` is an allowlisted attribution hint (`website` or `feed-hub`), defaults to `website`, and is not an authorization or trust signal.

### Validation rules

- Required company/contact/email/phone/country/route/direction/mode/Incoterm, cargo description, gross weight, positive integer package count and package type.
- Sea freight requires FCL or LCL; FCL requires container type.
- Air freight requires CBM or all three outer dimensions.
- Numeric values must be finite and positive where supplied.
- Consent must be true.
- `website` is a honeypot and must be empty.
- Max body: 24 KiB.
- Only known enums accepted; content remains untrusted customer input and must be escaped in any later internal/admin display.

### Success response — `201 Created`

```json
{
  "reference": "LPS-2026-A1B2C3D4",
  "status": "NEW",
  "createdAt": "2026-10-21T10:00:00.000Z"
}
```

Only public-safe request metadata is returned. No database ID, internal comments, rates, margins, supplier information or CRM fields are returned.

### Error responses

| HTTP | Error code | Meaning |
|---:|---|---|
| 400 | `invalid_json`, `validation_failed`, `invalid_submission`, `invalid_idempotency_key` | Malformed/invalid request. `validation_failed.fields` contains field paths and validation keys, not submitted values. |
| 403 | `origin_not_allowed` | Browser `Origin` does not match request origin. |
| 413 | `payload_too_large` | Body exceeds maximum. |
| 415 | `unsupported_media_type` | Request must be JSON. |
| 429 | `rate_limited` | Per-IP/time-window limit reached; `Retry-After` is returned. |
| 503 | `rfq_service_not_configured`, `rfq_service_unavailable` | Database, rate-limit secret, privacy approval or persistence unavailable; no success claimed. |

### Persistence and events

Within one Prisma/PostgreSQL transaction the repository:

1. returns the existing record if the same idempotency key already exists;
2. upserts the normalized company identity and normalized contact email;
3. links contact and company through the join table;
4. creates the RFQ and one CargoItem;
5. appends initial `NEW` status history;
6. writes an `rfq.created` OutboxEvent with a stable idempotency key.

A background outbox dispatcher, internal admin API, authentication, quote endpoints and n8n webhook are not implemented in this MVP.
