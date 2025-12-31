import { useRef, useEffect, useState } from "react";
import { Copy, Check, Sparkles, RefreshCw, Briefcase, Palette, Code, Megaphone, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { EnhanceMode } from "./ModeSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EnhancedResultProps {
  content: string;
  isLoading: boolean;
  onReset: () => void;
  onRegenerate?: (mode?: EnhanceMode) => void;
  mode?: EnhanceMode;
}

export function EnhancedResult({ content, isLoading, onReset, onRegenerate, mode = "formal" }: EnhancedResultProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const MODE_CONFIG: Record<EnhanceMode, { labelKey: keyof typeof t; icon: typeof Briefcase }> = {
    formal: { labelKey: "formal", icon: Briefcase },
    creative: { labelKey: "creative", icon: Palette },
    technical: { labelKey: "technical", icon: Code },
    marketing: { labelKey: "marketing", icon: Megaphone },
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [content]);

  if (!content && !isLoading) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success(t.copiedToClipboard);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t.copyFailed);
    }
  };

  const ModeIcon = MODE_CONFIG[mode].icon;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-card/90 backdrop-blur-xl rounded-3xl border border-aurora-purple/30 shadow-xl overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-gradient-to-r from-aurora-purple/10 to-aurora-pink/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aurora-purple to-aurora-pink flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{t.enhancedPrompt}</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded-full bg-aurora-purple/20 text-aurora-purple flex items-center gap-1">
                <ModeIcon className="w-3 h-3" />
                {t[MODE_CONFIG[mode].labelKey] as string}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Regenerate dropdown */}
          {onRegenerate && content && !isLoading && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Regenerate
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onRegenerate()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Same mode ({t[MODE_CONFIG[mode].labelKey] as string})
                </DropdownMenuItem>
                {Object.entries(MODE_CONFIG).filter(([key]) => key !== mode).map(([key, config]) => {
                  const ItemIcon = config.icon;
                  return (
                    <DropdownMenuItem key={key} onClick={() => onRegenerate(key as EnhanceMode)}>
                      <ItemIcon className="w-4 h-4 mr-2" />
                      {t[config.labelKey] as string} mode
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <button
            onClick={onReset}
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label={t.newPrompt}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            disabled={!content || isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background hover:bg-foreground/90 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                {t.copied}
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                {t.copy}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={scrollRef}
        className="max-h-[500px] overflow-y-auto p-6"
      >
        {isLoading && !content ? (
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-aurora-purple rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-aurora-pink rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-aurora-orange rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-sm">{t.enhancing}</span>
          </div>
        ) : (
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-foreground font-sans text-sm leading-relaxed bg-muted/50 rounded-xl p-4 border border-border/50">
              {content}
              {isLoading && (
                <span className="inline-block w-0.5 h-5 bg-gradient-to-b from-aurora-purple to-aurora-pink animate-pulse ml-0.5 align-middle" />
              )}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {content && (
        <div className="px-6 py-3 border-t border-border/50 bg-muted/30 flex justify-between text-xs text-muted-foreground">
          <span>{content.length.toLocaleString()} {t.characters}</span>
          <span>{content.split(/\s+/).filter(Boolean).length.toLocaleString()} {t.words}</span>
        </div>
      )}
    </div>
  );
}
