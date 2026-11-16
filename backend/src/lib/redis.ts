import Redis from "ioredis";
import { env } from "../config/env";
import { safeError } from "./log-safety";
import { logger } from "./structured-logging";

const REDIS_URL = env.redisUrl ?? "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on("error", (err) => {
  logger.error("[Redis] Connection error", undefined, safeError(err));
});

redis.on("connect", () => {
  logger.info("[Redis] Connected");
});
