import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2, History, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface RefinementChatProps {
  onRefine: (instruction: string) => Promise<void> | void;
  isLoading?: boolean;
  disabled?: boolean;
  context?: {
    theme?: string;
    layoutType?: string;
    style?: string;
  };
}

// P0 - 1.3: Basic input cleaning
const sanitizeInput = (input: string): string => {
  return input
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gm, "")
    .replace(/<[^>]+>/g, "")
    .replace(/javascript:/gi, "")
    .trim();
};

export function RefinementChat({
  onRefine,
  isLoading,
  disabled,
  context,
}: RefinementChatProps) {
  const [instruction, setInstruction] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  // Use lazy initialization for localStorage to avoid hydration mismatch if possible,
  // though simple here. (P2 - 9.1 LocalStorage implementation simplified)
  const [history, setHistory] = useState<string[]>(() => {
    try {
      if (typeof window === "undefined") return [];
      const stored = localStorage.getItem("refinement-history");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // P1 - 6.1: Context-aware suggestions
  const contextSuggestions = useMemo(() => {
    const base = ["Make the padding larger", "Make it responsive"];

    if (context?.theme === "dark") {
      base.unshift("Add a subtle glow effect");
      base.unshift("Increase contrast for dark mode");
    } else if (context?.theme === "light") {
      base.unshift("Add soft shadows");
      base.unshift("Use warmer colors");
    }

    if (context?.layoutType === "hero") {
      base.push("Make the headline larger");
      base.push("Add a call-to-action button");
    } else if (context?.layoutType === "features") {
      base.push("Use grid layout for features");
      base.push("Add icons to feature cards");
    }

    if (context?.style === "glass") {
      base.push("Increase blur intensity");
      base.push("Make borders more transparent");
    }

    return base.slice(0, 6);
  }, [context]);

  const activeSuggestions = showHistory ? history : contextSuggestions;

  // P0 - 1.3: Strict Validation
  const validateInstruction = (
    input: string,
  ): { valid: boolean; message?: string } => {
    if (input.length < 3)
      return { valid: false, message: "Instruction too short." };
    if (input.length > 500)
      return { valid: false, message: "Instruction too long (max 500 chars)." };

    const dangerous = [
      /eval\(/i,
      /Function\(/i,
      /document\.cookie/i,
      /window\.localStorage/i,
      /drop table/i, // basic SQLi prevention (habitual)
    ];

    if (dangerous.some((r) => r.test(input))) {
      return {
        valid: false,
        message: "Unsafe characters or commands detected.",
      };
    }

    return { valid: true };
  };

  const handleSubmit = async () => {
    const sanitized = sanitizeInput(instruction);
    const validation = validateInstruction(sanitized);

    if (!validation.valid) {
      toast.error("Invalid Instruction", { description: validation.message });
      return;
    }

    if (isLoading || disabled) return;

    try {
      await onRefine(sanitized);

      const newHistory = [
        sanitized,
        ...history.filter((h) => h !== sanitized),
      ].slice(0, 10);
      setHistory(newHistory);
      localStorage.setItem("refinement-history", JSON.stringify(newHistory));

      setInstruction("");
      toast.success("Refinement instruction sent");
    } catch (error: any) {
      toast.error("Refinement failed", { description: error.message });
    }
  };

  // P1 - 7.2: Keyboard Navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === "Escape") {
      setInstruction("");
      setShowHistory(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("refinement-history");
    toast.info("History cleared");
  };

  return (
    <div className="border-t border-neutral-800 bg-neutral-950/95 px-3 py-2 flex flex-col gap-2">
      {!disabled && (
        <div className="flex items-center justify-between min-h-[2rem]">
          <div
            className="flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-1 pr-2 mask-linear-fade"
            role="list"
            aria-label="Refinement suggestions"
          >
            <AnimatePresence mode="popLayout">
              {activeSuggestions.map((suggestion, idx) => (
                <motion.button
                  key={`${suggestion}-${idx}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setInstruction(suggestion)}
                  // P1 - 7.2: Accessible Button
                  className="whitespace-nowrap px-2 py-0.5 text-[0.65rem] rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-400 hover:border-emerald-500/50 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  aria-label={`Use suggestion: ${suggestion}`}
                >
                  {suggestion}
                </motion.button>
              ))}
              {activeSuggestions.length === 0 && showHistory && (
                <span className="text-[0.65rem] text-neutral-600 italic pl-1">
                  No history yet
                </span>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 pl-2 border-l border-neutral-800">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowHistory(!showHistory)}
              className={cn(
                "h-5 w-5 rounded-full transition-colors",
                showHistory
                  ? "text-emerald-400 bg-emerald-500/10"
                  : "text-neutral-500 hover:text-neutral-300",
              )}
              title={showHistory ? "Show Suggestions" : "Show History"}
              aria-label={
                showHistory ? "Switch to suggestions" : "Switch to history"
              }
            >
              <History className="h-3 w-3" />
            </Button>
            {showHistory && history.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearHistory}
                className="h-5 w-5 rounded-full text-neutral-500 hover:text-red-400"
                title="Clear History"
                aria-label="Clear history"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="relative group">
        <input
          type="text"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? "Generate a component first..."
              : "Describe changes (e.g. 'Make buttons rounder')..."
          }
          disabled={disabled || isLoading}
          className={cn(
            "w-full pl-3 pr-12 py-2.5 text-[0.8rem] rounded-lg border bg-neutral-900/60 text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-sm",
            disabled
              ? "border-neutral-800 cursor-not-allowed opacity-60"
              : "border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/80",
          )}
          aria-label="Refinement instruction input"
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!instruction.trim() || isLoading || disabled}
            className="h-7 w-7 p-0 rounded-md bg-emerald-500 hover:bg-emerald-400 text-neutral-950 disabled:bg-neutral-800 disabled:text-neutral-600 transition-colors"
            aria-label="Send instruction"
          >
            {isLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>

      {disabled && (
        <div className="flex items-center gap-1.5 text-[0.65rem] text-neutral-500 px-1">
          <AlertCircle className="h-3 w-3" />
          <span>Generate a component to enable AI refinements</span>
        </div>
      )}
    </div>
  );
}
