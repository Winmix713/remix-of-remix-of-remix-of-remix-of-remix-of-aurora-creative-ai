import { logger } from "./logger.ts";

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const RATE_LIMIT_PER_MINUTE = 60;
const WINDOW_MS = 60 * 1000;

export function checkRateLimit(
  ip: string,
  requestId: string
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up expired entry
  if (entry && entry.resetAt < now) {
    logger.debug(`Rate limit for IP ${ip} expired, resetting.`, { requestId });
    rateLimitMap.delete(ip);
  }

  const current = rateLimitMap.get(ip);

  if (!current) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    logger.debug(`First request for IP ${ip}.`, { requestId, remaining: RATE_LIMIT_PER_MINUTE - 1 });
    return { allowed: true, remaining: RATE_LIMIT_PER_MINUTE - 1, resetIn: WINDOW_MS };
  }

  if (current.count >= RATE_LIMIT_PER_MINUTE) {
    logger.warn(`Rate limit exceeded for IP ${ip}.`, { requestId, count: current.count });
    return {
      allowed: false,
      remaining: 0,
      resetIn: current.resetAt - now,
    };
  }

  current.count++;
  logger.debug(`Request for IP ${ip}.`, { requestId, remaining: RATE_LIMIT_PER_MINUTE - current.count });
  return {
    allowed: true,
    remaining: RATE_LIMIT_PER_MINUTE - current.count,
    resetIn: current.resetAt - now,
  };
}
