import { createHmac } from "node:crypto";
import { getPrismaClient } from "@leopard/database";

const WINDOW_MS = 15 * 60 * 1000;
const MAX_REQUESTS = 5;
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanupAt = 0;

export type RateLimitResult = {
  allowed: boolean;
  retryAfterSeconds: number;
};

export async function consumeRfqRateLimit(
  clientIdentifier: string,
  secret: string,
  now = Date.now(),
): Promise<RateLimitResult> {
  const windowIndex = Math.floor(now / WINDOW_MS);
  const expiresAt = new Date((windowIndex + 1) * WINDOW_MS);
  const key = createHmac("sha256", secret)
    .update(`website-rfq:${windowIndex}:${clientIdentifier}`)
    .digest("hex");
  const prisma = getPrismaClient();

  const bucket = await prisma.rateLimitBucket.upsert({
    where: { key },
    create: { key, requestCount: 1, expiresAt },
    update: { requestCount: { increment: 1 } },
  });

  if (now - lastCleanupAt > CLEANUP_INTERVAL_MS) {
    lastCleanupAt = now;
    void prisma.rateLimitBucket
      .deleteMany({ where: { expiresAt: { lt: new Date(now) } } })
      .catch(() => undefined);
  }

  return {
    allowed: bucket.requestCount <= MAX_REQUESTS,
    retryAfterSeconds: Math.max(1, Math.ceil((expiresAt.getTime() - now) / 1000)),
  };
}
