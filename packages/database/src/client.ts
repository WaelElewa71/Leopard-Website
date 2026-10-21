import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  leopardPrisma?: PrismaClient;
};

export function getPrismaClient(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_NOT_CONFIGURED");
  }

  if (!globalForPrisma.leopardPrisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    globalForPrisma.leopardPrisma = new PrismaClient({ adapter });
  }

  return globalForPrisma.leopardPrisma;
}
