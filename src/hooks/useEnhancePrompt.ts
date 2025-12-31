import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useApiCall } from "./useApiCall";
import {
  classifyEnhanceError,
  ERROR_MESSAGES,
  type EnhanceErrorType,
  ApiError,
} from "@/utils/errors";
import type { EnhanceMode, LoadingStage, EnhanceResult } from "@/types/enhance";

const BASE_API_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-prompt`;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useEnhancePrompt() {
  const { t, language } = useLanguage();
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [lastMode, setLastMode] = useState<EnhanceMode>("formal");
  const [lastFileType, setLastFileType] = useState<string | undefined>();
  const [lastOriginalContent, setLastOriginalContent] = useState<string>("");
  const [lastImageData, setLastImageData] = useState<string[] | undefined>();
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<EnhanceErrorType | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Show localized error message with appropriate toast type
   */
  const showLocalizedError = useCallback(
    (type: EnhanceErrorType, customMessage?: string) => {
      const messages = ERROR_MESSAGES[type];
      const message = customMessage || (language === "hu" ? messages.hu : messages.en);

      if (type === "network" || type === "timeout") {
        toast.error(message, {
          action: {
            label: language === "hu" ? "Újra" : "Retry",
            onClick: () => regenerate(),
          },
        });
      } else if (type === "rate-limit") {
        toast.warning(message, { duration: 10000 });
      } else {
        toast.error(message);
      }
    },
    [language]
  );

  const enhancePrompt = useCallback(
    async (
      content: string,
      mode: EnhanceMode = "formal",
      fileType?: string,
      imageData?: string[]
    ): Promise<EnhanceResult | null> => {
      const hasImages = Array.isArray(imageData) && imageData.length > 0;
      if (!content.trim() && !hasImages) return null;
      
      if (isEnhancing) {
        toast.info(language === "hu" ? "A kiegészítés már folyamatban van." : "Enhancement already in progress.");
        return null;
      }

      // Cancel any ongoing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setIsEnhancing(true);
      setEnhancedPrompt("");
      setError(null);
      setErrorType(null);
      setLastMode(mode);
      setLastFileType(fileType);
      setLastOriginalContent(content || "[Image-based prompt]");
      setLastImageData(imageData);
      setLoadingStage("connecting");
      setRetryCount(0);

      let result = "";

      try {
        setLoadingStage("analyzing");

        const resp = await fetch(BASE_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ content, mode, imageData }),
          signal: abortControllerRef.current.signal,
        });

        if (!resp.ok) {
          const errorData = await resp.json().catch(() => ({}));
          const errorMessage = errorData.error || `Request failed: ${resp.status}`;
          const errType = classifyEnhanceError(new ApiError(resp.status, errorMessage));

          setError(errorMessage);
          setErrorType(errType);
          showLocalizedError(errType, errorMessage);
          throw new Error(errorMessage);
        }

        if (!resp.body) {
          throw new Error("No response body");
        }

        setLoadingStage("enhancing");

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let tokenCount = 0;

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
            if (jsonStr === "[DONE]") {
              setLoadingStage("finalizing");
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const deltaContent = parsed.choices?.[0]?.delta?.content;
              if (deltaContent) {
                result += deltaContent;
                tokenCount++;
                if (tokenCount > 10) setLoadingStage("enhancing");
                setEnhancedPrompt(result);
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
                result += deltaContent;
                setEnhancedPrompt(result);
              }
            } catch {
              // ignore partial JSON
            }
          }
        }

        toast.success(t.promptSuccess);
        return {
          result,
          mode,
          fileType,
          originalContent: content || "[Image-based prompt]",
        };
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          setErrorType("abort");
          return null;
        }
        console.error("Enhance error:", err);
        return null;
      } finally {
        setIsEnhancing(false);
      }
    },
    [isEnhancing, t, language, showLocalizedError]
  );

  const regenerate = useCallback(
    async (newMode?: EnhanceMode) => {
      if (!lastOriginalContent && !lastImageData) {
        toast.error(language === "hu" ? "Nincs korábbi prompt a regeneráláshoz." : "No previous prompt to regenerate.");
        return null;
      }
      setRetryCount((prev) => prev + 1);
      return enhancePrompt(
        lastOriginalContent === "[Image-based prompt]" ? "" : lastOriginalContent,
        newMode || lastMode,
        lastFileType,
        lastImageData
      );
    },
    [lastOriginalContent, lastMode, lastFileType, lastImageData, enhancePrompt, language]
  );

  const retry = useCallback(() => {
    regenerate();
  }, [regenerate]);

  const clearEnhanced = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setEnhancedPrompt("");
    setLastOriginalContent("");
    setLastFileType(undefined);
    setLastImageData(undefined);
    setError(null);
    setErrorType(null);
    setRetryCount(0);
    setLoadingStage("connecting");
  }, []);

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      toast.info(language === "hu" ? "A kérés megszakítva." : "Request aborted.");
    }
  }, [language]);

  return {
    enhancedPrompt,
    isEnhancing,
    enhancePrompt,
    clearEnhanced,
    regenerate,
    retry,
    lastMode,
    lastFileType,
    lastOriginalContent,
    loadingStage,
    error,
    errorType,
    retryCount,
    abort,
  };
}
