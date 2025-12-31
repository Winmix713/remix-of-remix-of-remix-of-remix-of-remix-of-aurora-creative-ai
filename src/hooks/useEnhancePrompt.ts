import { useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { EnhanceMode } from "@/components/aurora/ModeSelector";
import { useLanguage } from "@/contexts/LanguageContext";

type LoadingStage = "connecting" | "analyzing" | "enhancing" | "finalizing";
type ErrorType = "network" | "rate-limit" | "payment" | "generic";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useEnhancePrompt() {
  const { t } = useLanguage();
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [lastMode, setLastMode] = useState<EnhanceMode>("formal");
  const [lastFileType, setLastFileType] = useState<string | undefined>();
  const [lastOriginalContent, setLastOriginalContent] = useState<string>("");
  const [lastImageData, setLastImageData] = useState<string | string[] | undefined>();
  const [loadingStage, setLoadingStage] = useState<LoadingStage>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<ErrorType>("generic");
  const [retryCount, setRetryCount] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const classifyError = (status: number, message: string): ErrorType => {
    if (status === 429) return "rate-limit";
    if (status === 402) return "payment";
    if (message.toLowerCase().includes("network") || message.toLowerCase().includes("fetch")) return "network";
    return "generic";
  };

  const enhancePrompt = useCallback(async (
    content: string, 
    mode: EnhanceMode = "formal",
    fileType?: string,
    imageData?: string | string[],
    isRetry = false
  ): Promise<{ result: string; mode: EnhanceMode; fileType?: string; originalContent: string } | null> => {
    const hasImages = Array.isArray(imageData) ? imageData.length > 0 : !!imageData;
    if ((!content.trim() && !hasImages) || (isEnhancing && !isRetry)) return null;

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsEnhancing(true);
    setEnhancedPrompt("");
    setError(null);
    setLastMode(mode);
    setLastFileType(fileType);
    setLastOriginalContent(content || "[Image-based prompt]");
    setLastImageData(imageData);
    setLoadingStage("connecting");

    let result = "";

    try {
      setLoadingStage("analyzing");
      
      const resp = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/enhance-prompt`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ content, mode, imageData }),
          signal: abortControllerRef.current.signal,
        }
      );

      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        const errorMessage = errorData.error || `Request failed: ${resp.status}`;
        const errType = classifyError(resp.status, errorMessage);
        
        setError(errorMessage);
        setErrorType(errType);
        
        // Auto-retry for network errors
        if (errType === "network" && retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          await delay(RETRY_DELAY * (retryCount + 1));
          return enhancePrompt(content, mode, fileType, imageData, true);
        }
        
        throw new Error(errorMessage);
      }

      if (!resp.body) {
        throw new Error("No response body");
      }

      setLoadingStage("enhancing");
      setRetryCount(0);

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
              // Update stage based on progress
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
      return { result, mode, fileType, originalContent: content || "[Image-based prompt]" };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return null;
      }
      console.error("Enhance error:", err);
      const message = err instanceof Error ? err.message : "Failed to enhance prompt";
      setError(message);
      if (!errorType || errorType === "generic") {
        setErrorType("generic");
      }
      toast.error(message);
      return null;
    } finally {
      setIsEnhancing(false);
    }
  }, [isEnhancing, t, retryCount, errorType]);

  const regenerate = useCallback(async (newMode?: EnhanceMode) => {
    if (!lastOriginalContent && !lastImageData) return null;
    setRetryCount(0);
    return enhancePrompt(
      lastOriginalContent === "[Image-based prompt]" ? "" : lastOriginalContent,
      newMode || lastMode,
      lastFileType,
      lastImageData,
      true
    );
  }, [lastOriginalContent, lastMode, lastFileType, lastImageData, enhancePrompt]);

  const retry = useCallback(() => {
    setRetryCount(prev => prev + 1);
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
    setRetryCount(0);
  }, []);

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
  };
}
