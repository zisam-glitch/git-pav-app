import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: env.logPrismaQueries
      ? ["query", "warn", "error"]
      : ["error"],
  });

if (!env.isProduction) globalForPrisma.prisma = prisma;

