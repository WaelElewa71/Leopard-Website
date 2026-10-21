import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "packages/database/prisma/schema.prisma",
  migrations: {
    path: "packages/database/prisma/migrations",
  },
  datasource: {
    // A local-only fallback allows `prisma generate` without a configured DB.
    // Migrations and runtime connections still require an owner-managed DATABASE_URL.
    url:
      process.env.DATABASE_URL ??
      "postgresql://leopard:local-only@localhost:5432/leopard?schema=public",
  },
});
