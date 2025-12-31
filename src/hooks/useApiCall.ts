import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { ApiError } from "@/utils/errors";
import { delay } from "@/utils/helpers";

interface UseApiCallOptions<T> {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  headers?: Record<string, string>;
  retries?: number;
  retryDelay?: number;
  onRetry?: (attempt: number, delayMs: number) => void;
  isStreaming?: boolean;
  onStreamChunk?: (chunk: string) => void;
  onStreamDone?: (finalResult: string) => void;
}

interface UseApiCallResult<T> {
  data: T | null;
  error: Error | null;
  isLoading: boolean;
  execute: (overrideBody?: unknown, overrideHeaders?: Record<string, string>) => Promise<T | null>;
  abort: () => void;
  retryCount: number;
  isAborting: boolean;
}

const DEFAULT_RETRIES = 3;
const DEFAULT_RETRY_DELAY = 1000;
const EXPONENTIAL_BACKOFF_FACTOR = 2;
const JITTER_FACTOR = 0.2;

export function useApiCall<T>({
  url,
  method = "POST",
  body,
  headers = {},
  retries = DEFAULT_RETRIES,
  retryDelay = DEFAULT_RETRY_DELAY,
  onRetry,
  isStreaming = false,
  onStreamChunk,
  onStreamDone,
}: UseApiCallOptions<T>): UseApiCallResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [isAborting, setIsAborting] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (overrideBody?: unknown, overrideHeaders?: Record<string, string>): Promise<T | null> => {
      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        setIsAborting(false);
      }
      abortControllerRef.current = new AbortController();

      setIsLoading(true);
      setError(null);
      setData(null);
      setRetryAttempt(0);

      const requestBody = overrideBody ?? body;
      const requestHeaders = { ...headers, ...overrideHeaders };

      for (let attempt = 0; attempt <= retries; attempt++) {
        setRetryAttempt(attempt);
        try {
          const resp = await fetch(url, {
            method,
            headers: {
              "Content-Type": "application/json",
              ...requestHeaders,
            },
            body: requestBody ? JSON.stringify(requestBody) : undefined,
            signal: abortControllerRef.current.signal,
          });

          if (!resp.ok) {
            const errorData = await resp.json().catch(() => ({}));
            const errorMessage = errorData.error || `Request failed: ${resp.status}`;
            throw new ApiError(resp.status, errorMessage);
          }

          if (isStreaming) {
            if (!resp.body) {
              throw new Error("No response body for streaming request.");
            }
            
            const reader = resp.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";
            let finalStreamResult = "";

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });

              let newlineIndex: number;
              while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
                let line = buffer.slice(0, newlineIndex);
                buffer = buffer.slice(newlineIndex + 1);

                if (line.endsWith("\r")) line = line.slice(0, -1);
                if (line.startsWith(":") || line.trim() === "") continue;
                if (!line.startsWith("data: ")) continue;

                const jsonStr = line.slice(6).trim();
                if (jsonStr === "[DONE]") break;

                try {
                  const parsed = JSON.parse(jsonStr);
                  const deltaContent = parsed.choices?.[0]?.delta?.content;
                  if (deltaContent) {
                    finalStreamResult += deltaContent;
                    onStreamChunk?.(finalStreamResult);
                  }
                } catch {
                  buffer = line + "\n" + buffer;
                  break;
                }
              }
            }

            // Flush remaining buffer
            if (buffer.trim()) {
              for (let raw of buffer.split("\n")) {
                if (!raw) continue;
                if (raw.endsWith("\r")) raw = raw.slice(0, -1);
                if (!raw.startsWith("data: ")) continue;
                const jsonStr = raw.slice(6).trim();
                if (jsonStr === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(jsonStr);
                  const deltaContent = parsed.choices?.[0]?.delta?.content;
                  if (deltaContent) {
                    finalStreamResult += deltaContent;
                    onStreamChunk?.(finalStreamResult);
                  }
                } catch {
                  // ignore partial JSON
                }
              }
            }

            onStreamDone?.(finalStreamResult);
            setIsLoading(false);
            return finalStreamResult as T;
          } else {
            const result = await resp.json();
            setData(result);
            setIsLoading(false);
            return result;
          }
        } catch (err) {
          if (err instanceof Error && err.name === "AbortError") {
            setIsAborting(true);
            setIsLoading(false);
            return null;
          }

          if (attempt < retries) {
            const currentDelay = retryDelay * Math.pow(EXPONENTIAL_BACKOFF_FACTOR, attempt);
            const jitter = currentDelay * JITTER_FACTOR * (Math.random() - 0.5);
            const delayMs = Math.round(currentDelay + jitter);

            onRetry?.(attempt + 1, delayMs);
            await delay(delayMs);
            continue;
          }

          setError(err as Error);
          setIsLoading(false);
          return null;
        }
      }
      
      setIsLoading(false);
      return null;
    },
    [url, method, body, headers, retries, retryDelay, onRetry, isStreaming, onStreamChunk, onStreamDone]
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      setIsAborting(true);
      abortControllerRef.current.abort();
      toast.info("A kérés megszakítva.");
      setTimeout(() => {
        setIsAborting(false);
        setIsLoading(false);
        setError(null);
        setData(null);
        setRetryAttempt(0);
      }, 300);
    }
  }, []);

  return {
    data,
    error,
    isLoading,
    execute,
    abort,
    retryCount: retryAttempt,
    isAborting,
  };
}
