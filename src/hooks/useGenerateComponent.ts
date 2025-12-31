import { useState, useCallback, useRef } from "react";
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
  
  // Refek a renderelések elkerülésére a logikában
  const abortControllerRef = useRef<AbortController | null>(null);

  const generateComponent = useCallback(async (
    config: ComponentConfig,
    refinement?: RefinementRequest
  ) => {
    // 1. Előző kérés megszakítása, ha van folyamatban
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsGenerating(true);
    setError(null);
    
    // UI döntés: Ha nem finomítás (refinement), töröljük a kódot.
    // Ha finomítás, megtartjuk a régit amíg be nem indul az új stream, vagy töröljük ízlés szerint.
    if (!refinement) {
      setGeneratedCode("");
    }

    const GENERATE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-component`;
    
    let accumulatedCode = refinement ? "" : ""; // Ha refinement, akkor is nulláról építjük az választ, nem appendelünk
    let lastUpdateTime = 0;
    const UPDATE_INTERVAL = 50; // ms - Ennyi időnként frissítjük a UI-t maximum

    try {
      const response = await fetch(GENERATE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ config, refinement }),
        signal: controller.signal, // 2. Abort signal bekötése
      });

      if (!response.ok) {
        if (response.status === 429) throw new Error("Túl sok kérés. Kérlek várj egy kicsit.");
        if (response.status === 402) throw new Error("Kredit limit elérve.");
        throw new Error(`Hiba a generálás során: ${response.statusText}`);
      }

      if (!response.body) throw new Error("Üres válasz érkezett");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        // 3. Biztonságosabb buffer feldolgozás
        const lines = buffer.split("\n");
        // Az utolsó elem lehet, hogy nem teljes sor, azt visszatesszük a pufferbe
        buffer = lines.pop() || ""; 

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith(":") || trimmedLine === "data: [DONE]") continue;
            
            if (trimmedLine.startsWith("data: ")) {
                try {
                    const jsonStr = trimmedLine.slice(6);
                    const parsed = JSON.parse(jsonStr);
                    const content = parsed.choices?.[0]?.delta?.content;

                    if (content) {
                        accumulatedCode += content;
                        
                        // 4. Throttling: Csak bizonyos időközönként frissítjük a React state-et
                        const now = Date.now();
                        if (now - lastUpdateTime > UPDATE_INTERVAL) {
                            setGeneratedCode(cleanCodeOutput(accumulatedCode));
                            lastUpdateTime = now;
                        }
                    }
                } catch (e) {
                    console.warn("JSON parse error in stream line:", trimmedLine, e);
                    // Nem dobunk hibát, hogy ne szakadjon meg a stream egyetlen rossz csomag miatt
                }
            }
        }
      }

      // Végső frissítés a ciklus után, hogy biztosan minden karakter kikerüljön
      const finalCode = cleanCodeOutput(accumulatedCode);
      setGeneratedCode(finalCode);

      if (!refinement) {
        toast.success("Komponens sikeresen legenerálva!");
      } else {
        toast.success("Komponens frissítve!");
      }

    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('Generálás megszakítva felhasználó által.');
        return; // Ne kezeljük hibaként
      }

      const errorMessage = err instanceof Error ? err.message : "Ismeretlen hiba történt";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      // Csak akkor állítjuk le a loadingot, ha ez a controller az aktuális
      if (abortControllerRef.current === controller) {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    }
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
        setIsGenerating(false);
        toast.info("Generálás leállítva.");
    }
  }, []);

  const reset = useCallback(() => {
    stopGeneration();
    setGeneratedCode("");
    setError(null);
  }, [stopGeneration]);

  return {
    generatedCode,
    isGenerating,
    error,
    generateComponent,
    stopGeneration, // Új funkció exportálása
    reset,
  };
}

// Utility: Markdown tisztító (kicsit optimalizálva)
function cleanCodeOutput(code: string): string {
  // Gyors ellenőrzés: ha nincs markdown jelölő, ne regexezzünk feleslegesen
  if (!code.includes("```")) return code;

  let cleaned = code;
  // Eltávolítja a ```tsx, ```javascript, stb. kezdetet
  cleaned = cleaned.replace(/^```[a-z]*\n?/i, "");
  // Eltávolítja a záró ```-t
  cleaned = cleaned.replace(/```$/, "");
  
  return cleaned;
}