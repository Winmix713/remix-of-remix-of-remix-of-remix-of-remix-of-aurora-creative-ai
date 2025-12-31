import { Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface LoadingSkeletonProps {
  stage?: "connecting" | "analyzing" | "enhancing" | "finalizing";
}

export function LoadingSkeleton({ stage = "connecting" }: LoadingSkeletonProps) {
  const { t } = useLanguage();
  
  const stages = {
    connecting: { progress: 15, label: "Connecting to Aurora AI..." },
    analyzing: { progress: 40, label: "Analyzing your content..." },
    enhancing: { progress: 70, label: "Enhancing your prompt..." },
    finalizing: { progress: 90, label: "Finalizing result..." },
  };

  const current = stages[stage];

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-card/90 backdrop-blur-xl rounded-3xl border border-aurora-purple/30 shadow-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-aurora-purple/10 to-aurora-pink/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aurora-purple to-aurora-pink flex items-center justify-center animate-pulse">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t.enhancedPrompt}</h3>
            <span className="text-xs text-muted-foreground">{current.label}</span>
          </div>
        </div>
      </div>

      {/* Loading content */}
      <div className="p-6 space-y-4">
        {/* Progress bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-aurora-purple via-aurora-pink to-aurora-orange transition-all duration-500 ease-out"
            style={{ width: `${current.progress}%` }}
          />
        </div>

        {/* Skeleton lines */}
        <div className="space-y-3 pt-4">
          <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
          <div className="h-4 bg-muted/50 rounded animate-pulse w-5/6" style={{ animationDelay: "100ms" }} />
          <div className="h-4 bg-muted/50 rounded animate-pulse w-4/6" style={{ animationDelay: "200ms" }} />
          <div className="h-4 bg-muted/50 rounded animate-pulse w-5/6" style={{ animationDelay: "300ms" }} />
          <div className="h-4 bg-muted/50 rounded animate-pulse w-3/6" style={{ animationDelay: "400ms" }} />
        </div>

        {/* Typing indicator */}
        <div className="flex items-center gap-2 pt-4">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-aurora-purple rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-aurora-pink rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-aurora-orange rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-sm text-muted-foreground">Aurora is thinking...</span>
        </div>
      </div>
    </div>
  );
}
