import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface ComponentConfig {
  platform: string;
  layoutType: string;
  layoutConfig: string | null;
  framing: string | null;
  style: string;
  theme: string;
  accent: string;
  typeface: string;
  animations: string[];
  customPrompts: string[];
}

interface RefinementRequest {
  previousCode: string;
  instruction: string;
}

export function useGenerateComponent() {
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateComponent = useCallback(async (
    config: ComponentConfig,
    refinement?: RefinementRequest
  ) => {
    setIsGenerating(true);
    setError(null);
    
    if (!refinement) {
      setGeneratedCode("");
    }

    const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-component`;

    try {
      const response = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ config, refinement }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please try again in a moment.");
        }
        if (response.status === 402) {
          throw new Error("Usage limit reached. Please add credits.");
        }
        throw new Error("Failed to generate component");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let accumulatedCode = refinement ? "" : "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulatedCode += content;
              setGeneratedCode(cleanCodeOutput(accumulatedCode));
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              accumulatedCode += content;
            }
          } catch { /* ignore */ }
        }
      }

      const finalCode = cleanCodeOutput(accumulatedCode);
      setGeneratedCode(finalCode);
      
      if (!refinement) {
        toast.success("Component generated successfully!");
      } else {
        toast.success("Component updated!");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGeneratedCode("");
    setError(null);
  }, []);

  return {
    generatedCode,
    isGenerating,
    error,
    generateComponent,
    reset,
  };
}

// Clean up the code output - remove markdown code blocks if present
function cleanCodeOutput(code: string): string {
  let cleaned = code.trim();
  
  // Remove markdown code block markers
  if (cleaned.startsWith("```tsx") || cleaned.startsWith("```typescript") || cleaned.startsWith("```jsx")) {
    cleaned = cleaned.replace(/^```(?:tsx|typescript|jsx|javascript)?\n?/, "");
  }
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\n?/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/```$/, "");
  }
  
  return cleaned.trim();
}
