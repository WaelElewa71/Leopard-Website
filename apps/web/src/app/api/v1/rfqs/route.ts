import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createRfq } from "@/modules/rfq/application/create-rfq";
import { PrismaRfqRepository } from "@/modules/rfq/infrastructure/prisma-rfq-repository";
import { consumeRfqRateLimit } from "@/modules/rfq/infrastructure/postgres-rfq-rate-limiter";
import { rfqRequestSchema } from "@/modules/rfq/presentation/schemas/rfq-schema";

export const runtime = "nodejs";

const MAX_BODY_BYTES = 24 * 1024;

function sameOriginRequest(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = forwardedHost ?? request.headers.get("host");
    const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const protocol = forwardedProtocol ?? new URL(request.url).protocol.slice(0, -1);
    const expectedOrigin = host ? `${protocol}://${host}` : new URL(request.url).origin;
    return new URL(origin).origin === new URL(expectedOrigin).origin;
  } catch {
    return false;
  }
}

function clientIdentifier(request: NextRequest): string {
  // The deployment ingress must overwrite these headers; never trust arbitrary
  // forwarded headers from a client that can reach the app directly.
  return (
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown-client"
  );
}

function publicError(code: string, status: number, headers?: HeadersInit) {
  return NextResponse.json({ error: code }, { status, headers });
}

export async function POST(request: NextRequest) {
  if (!sameOriginRequest(request)) return publicError("origin_not_allowed", 403);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return publicError("unsupported_media_type", 415);
  }

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return publicError("payload_too_large", 413);

  const rateLimitSecret = process.env.RATE_LIMIT_HMAC_SECRET;
  if (
    !process.env.DATABASE_URL ||
    !rateLimitSecret ||
    rateLimitSecret.length < 32 ||
    process.env.PRIVACY_NOTICE_APPROVED !== "true"
  ) {
    return publicError("rfq_service_not_configured", 503);
  }

  try {
    const rateLimit = await consumeRfqRateLimit(clientIdentifier(request), rateLimitSecret);
    if (!rateLimit.allowed) {
      return publicError("rate_limited", 429, {
        "Retry-After": String(rateLimit.retryAfterSeconds),
      });
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "rfq.rate_limit.failed",
        errorType: error instanceof Error ? error.name : "unknown",
      }),
    );
    return publicError("rfq_service_unavailable", 503);
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return publicError("invalid_json", 400);
  }
  if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
    return publicError("payload_too_large", 413);
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody) as unknown;
  } catch {
    return publicError("invalid_json", 400);
  }

  const parsed = rfqRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation_failed",
        fields: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          code: issue.message,
        })),
      },
      { status: 400 },
    );
  }

  if (parsed.data.website?.trim()) return publicError("invalid_submission", 400);

  const idempotencyKey = request.headers.get("idempotency-key")?.trim();
  if (idempotencyKey && !/^[A-Za-z0-9._:-]{8,80}$/.test(idempotencyKey)) {
    return publicError("invalid_idempotency_key", 400);
  }

  const requestData = { ...parsed.data };
  delete requestData.website;
  const submission = { ...requestData, source: requestData.source ?? "website" };
  const currentYear = new Date().getFullYear();
  const reference = () => `LPS-${currentYear}-${randomBytes(4).toString("hex").toUpperCase()}`;

  try {
    const rfq = await createRfq(
      submission,
      { repository: new PrismaRfqRepository(), createReference: reference },
      idempotencyKey,
    );
    return NextResponse.json(
      { reference: rfq.reference, status: rfq.status, createdAt: rfq.createdAt.toISOString() },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "rfq.create.failed",
        errorType: error instanceof Error ? error.name : "unknown",
      }),
    );
    return publicError("rfq_service_unavailable", 503);
  }
}
