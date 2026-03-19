import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton v2.0
 * Optimized for multi-environment (SQLite Local / Postgres Prod)
 */

const prismaClientSingleton = () => {
  const isDev = process.env.NODE_ENV === "development";
  const projectMode = process.env.PROJECT_MODE || "internal/dev";

  return new PrismaClient({
    log: isDev || projectMode === "internal/dev" ? ["query", "error", "warn"] : ["error"],
  });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>; // eslint-disable-line no-var
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
