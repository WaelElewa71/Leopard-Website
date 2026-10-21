# Local development and deployment notes

## Requirements

- Node.js 22+ recommended/required by the repository engine; the workspace checks here ran on Node 20.20.2 and emitted a Node 22 engine warning for an optional Prisma development helper.
- npm 10.8+.
- Docker Engine + Compose only for local PostgreSQL.
- An owner-controlled PostgreSQL database for integration/production; no credentials are provided in this repository.

## Local setup

1. Copy `.env.example` to `.env` and replace local placeholders.
2. Start local PostgreSQL:

   ```bash
   docker compose -f infrastructure/docker/docker-compose.yml up -d
   ```

   The database binds to `127.0.0.1:5432` only. Keep this development password out of shared environments.

3. Install packages and generate the Prisma client:

   ```bash
   npm ci
   npm run db:generate
   npm run db:validate
   ```

4. Create/apply a development migration only against the local disposable database:

   ```bash
   npm run db:migrate
   ```

5. Start the public web app:

   ```bash
   npm run dev
   ```

   Open `http://localhost:3000/ar` or `/en`. `/` redirects to `/ar`.

6. Run checks:

   ```bash
   npm run lint
   npm run typecheck
   npm test
   npm run build
   ```

## RFQ endpoint readiness

Even with PostgreSQL running, RFQ submissions return `503` unless a 32+ character `RATE_LIMIT_HMAC_SECRET` and `PRIVACY_NOTICE_APPROVED=true` are configured. Do not set the approval flag until the real notice and process have been approved. Email/n8n dispatch is not wired; the current data flow writes only the transaction and outbox event.

## Production deployment checklist

- Use accounts, domain, DNS, hosting, object storage and email controlled by the owner or authorized administrator.
- Set `NEXT_PUBLIC_SITE_URL` to the verified canonical domain. Do not deploy with `leopard.invalid` sitemap fallback.
- Select hosting region/data residency with legal/privacy review; supply a private PostgreSQL connection string via secret manager.
- Use separate DB credentials per environment and minimum privileges; configure managed backups and prove restore.
- Configure trusted ingress to overwrite `X-Real-IP`/`X-Forwarded-For`; test same-origin checks behind the provider proxy.
- Set `RATE_LIMIT_HMAC_SECRET` from a secret manager and rotate it under a documented procedure.
- Publish approved privacy notice/terms/disclaimer and set `PRIVACY_NOTICE_APPROVED=true` only afterwards.
- Set security headers, logging redaction, alerting, uptime checks and incident contacts.
- Verify email sender domain only after selection/approval; never place credentials in source or workflow exports.
- Run migration plan against staging, then approved production maintenance window; retain rollback/backup plan.
- Measure Core Web Vitals and accessibility with real devices and content; do not claim scores before measurement.
- Verify sitemap, robots, canonical/hreflang, metadata and real contact data.
- No deployment has been performed by this implementation.
