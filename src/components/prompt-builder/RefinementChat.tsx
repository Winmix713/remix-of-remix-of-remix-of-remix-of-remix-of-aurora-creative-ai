import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RefinementChatProps {
  onRefine: (instruction: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function RefinementChat({ onRefine, isLoading, disabled }: RefinementChatProps) {
  const [instruction, setInstruction] = useState("");

  const handleSubmit = () => {
    if (!instruction.trim() || isLoading || disabled) return;
    onRefine(instruction.trim());
    setInstruction("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const suggestions = [
    "Make the button larger",
    "Add a gradient background",
    "Use more padding",
    "Add hover animations",
    "Make it responsive",
  ];

  return (
    <div className="border-t border-neutral-800 bg-neutral-950/95 px-3 py-2">
      {/* Quick suggestions */}
      {!disabled && !instruction && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {suggestions.slice(0, 3).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInstruction(suggestion)}
              className="px-2 py-0.5 text-[0.65rem] rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Generate a component first..." : "Refine the component..."}
            disabled={disabled || isLoading}
            className={cn(
              "w-full px-3 py-2 text-[0.8rem] rounded-lg border bg-neutral-900/80 text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-colors",
              disabled 
                ? "border-neutral-800 cursor-not-allowed opacity-60" 
                : "border-neutral-700 hover:border-neutral-600"
            )}
          />
        </div>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!instruction.trim() || isLoading || disabled}
          className="h-9 px-3 bg-emerald-500/90 hover:bg-emerald-400 text-neutral-950 font-medium disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>

      <p className="text-[0.65rem] text-neutral-500 mt-1.5">
        {disabled 
          ? "Generate a component to enable refinements" 
          : "Type a refinement instruction or click a suggestion"}
      </p>
    </div>
  );
}
