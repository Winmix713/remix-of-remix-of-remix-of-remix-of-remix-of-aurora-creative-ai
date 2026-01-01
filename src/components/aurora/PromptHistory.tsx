import { useState } from "react";
import { History, X, Trash2, Copy, Check, FileText, Image, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { PromptHistoryItem } from "@/hooks/usePromptHistory";
import type { EnhanceMode } from "@/types/enhance";
import { useLanguage } from "@/contexts/LanguageContext";

interface PromptHistoryProps {
  history: PromptHistoryItem[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onSelect: (item: PromptHistoryItem) => void;
}

const FILE_ICONS: Record<string, typeof FileText> = {
  image: Image,
  text: FileText,
};

export function PromptHistory({ history, isLoading, onDelete, onClearAll, onSelect }: PromptHistoryProps) {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const MODE_LABELS: Record<EnhanceMode, string> = {
    formal: t.formal,
    creative: t.creative,
    technical: t.technical,
    marketing: t.marketing,
  };

  const handleCopy = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast.success(t.copiedToClipboard);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error(t.copyFailed);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === "hu" ? "hu-HU" : "en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return null;
    const Icon = FILE_ICONS[fileType] || FileText;
    return <Icon className="w-3 h-3" />;
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-dark-elevated text-muted-foreground hover:text-foreground transition-colors text-sm mx-auto"
      >
        <History className="w-4 h-4" />
        <span>{t.history} ({history.length})</span>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="mt-4 bg-card/90 backdrop-blur-xl rounded-2xl border border-border/50 shadow-xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
            <h3 className="font-medium text-foreground text-sm">{t.promptHistory}</h3>
            <div className="flex items-center gap-2">
              {history.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  {t.deleteAll}
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-muted rounded-lg transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[300px] overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t.loading}
              </div>
            ) : history.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {t.noHistory}
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="flex-1 text-left"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-aurora-purple/20 text-aurora-purple">
                            {MODE_LABELS[item.mode]}
                          </span>
                          {item.file_type && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground flex items-center gap-1">
                              {getFileIcon(item.file_type)}
                              {item.file_type}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDate(item.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">
                          {item.original_content}
                        </p>
                      </button>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopy(item.enhanced_content, item.id)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          title={t.copy}
                        >
                          {copiedId === item.id ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => onDelete(item.id)}
                          className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          title={t.delete}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {expandedId === item.id && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-2">{t.enhancedPromptLabel}</p>
                        <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                          {item.enhanced_content}
                        </pre>
                        <button
                          onClick={() => onSelect(item)}
                          className="mt-3 text-xs text-aurora-purple hover:underline"
                        >
                          {t.useAsBase}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
