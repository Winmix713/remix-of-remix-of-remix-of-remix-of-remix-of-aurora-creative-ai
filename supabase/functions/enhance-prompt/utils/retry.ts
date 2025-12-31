import { logger } from "./logger.ts";

interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableStatuses: number[];
  requestId?: string;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retryOptions: Partial<RetryOptions> = {}
): Promise<Response> {
  const opts = { ...DEFAULT_OPTIONS, ...retryOptions };

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);

      if (response.ok || !opts.retryableStatuses.includes(response.status)) {
        return response;
      }

      if (attempt === opts.maxRetries) {
        logger.error(`Max retries reached for ${url} with status ${response.status}`, null, { requestId: opts.requestId });
        return response;
      }

      const currentDelay = opts.baseDelay * Math.pow(2, attempt);
      const jitter = currentDelay * 0.2 * (Math.random() - 0.5);
      const delay = Math.min(Math.round(currentDelay + jitter), opts.maxDelay);

      logger.warn(
        `Retry attempt ${attempt + 1}/${opts.maxRetries} for ${url}. Status: ${response.status}. Delaying for ${delay}ms.`,
        { requestId: opts.requestId }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    } catch (error) {
      if (attempt === opts.maxRetries) {
        logger.error(`Max retries reached due to network error for ${url}.`, error as Error, { requestId: opts.requestId });
        throw error;
      }

      const currentDelay = opts.baseDelay * Math.pow(2, attempt);
      const jitter = currentDelay * 0.2 * (Math.random() - 0.5);
      const delay = Math.min(Math.round(currentDelay + jitter), opts.maxDelay);

      logger.warn(
        `Network error on attempt ${attempt + 1}/${opts.maxRetries} for ${url}. Delaying for ${delay}ms.`,
        { requestId: opts.requestId }
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  logger.error("Fetch with retry failed unexpectedly", null, { requestId: opts.requestId });
  throw new Error("Fetch with retry failed after all attempts.");
}
