import { useState } from "react";
import { FloatingSphere } from "./FloatingSphere";
import { PromptInput } from "./PromptInput";
import { EnhancedResult } from "./EnhancedResult";
import { ModeSelector, EnhanceMode } from "./ModeSelector";
import { PromptHistory } from "./PromptHistory";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { ErrorState } from "./ErrorState";
import { useEnhancePrompt } from "@/hooks/useEnhancePrompt";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { useLanguage } from "@/contexts/LanguageContext";
import { PromptBuilderModal } from "@/components/prompt-builder/PromptBuilderModal";
import { Button } from "@/components/ui/button";
import { LayoutTemplate } from "lucide-react";

export function HeroSection() {
  const { t } = useLanguage();
  const { 
    enhancedPrompt, 
    isEnhancing, 
    enhancePrompt, 
    clearEnhanced, 
    regenerate,
    retry,
    lastMode,
    loadingStage,
    error,
    errorType,
    retryCount
  } = useEnhancePrompt();
  const { history, isLoading: historyLoading, saveToHistory, deleteFromHistory, clearAllHistory } = usePromptHistory();
  const [selectedMode, setSelectedMode] = useState<EnhanceMode>("formal");
  const [inputValue, setInputValue] = useState("");
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);

  const handleSubmit = async (content: string, fileType?: string, imageData?: string) => {
    const result = await enhancePrompt(content, selectedMode, fileType, imageData);
    
    // Save to history after successful enhancement
    if (result) {
      saveToHistory(result.originalContent, result.result, result.mode, result.fileType);
    }
  };

  const handleHistorySelect = (item: typeof history[0]) => {
    setInputValue(item.enhanced_content);
    setSelectedMode(item.mode);
  };

  // Determine what to show in the result area
  const showError = error && !isEnhancing && !enhancedPrompt;
  const showLoadingSkeleton = isEnhancing && !enhancedPrompt;
  const showResult = enhancedPrompt || (isEnhancing && enhancedPrompt);

  return (
    <section className="w-full flex flex-col items-center pt-16 md:pt-24 pb-12 px-4 max-w-6xl mx-auto">
      {/* Floating 3D Element */}
      <FloatingSphere />

      {/* Text Content */}
      <div className="text-center mb-10 max-w-3xl px-4">
        <p className="text-aurora-purple font-semibold mb-3 tracking-wide uppercase text-xs md:text-sm">
          {t.tagline}
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 drop-shadow-sm leading-tight">
          {t.heroTitle1} <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-aurora-purple via-aurora-pink to-aurora-orange">
            {t.heroTitle2}
          </span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-4">
          {t.heroDescription}
        </p>
        
        {/* Prompt Builder Button */}
        <Button
          onClick={() => setIsBuilderOpen(true)}
          className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-neutral-950 font-semibold px-5 py-2.5 rounded-full hover:from-emerald-400 hover:to-emerald-300 transition-all shadow-lg hover:shadow-emerald-500/25"
        >
          <LayoutTemplate className="w-4 h-4 mr-2" />
          Open Prompt Builder
        </Button>
      </div>

      {/* Prompt History */}
      <PromptHistory
        history={history}
        isLoading={historyLoading}
        onDelete={deleteFromHistory}
        onClearAll={clearAllHistory}
        onSelect={handleHistorySelect}
      />

      {/* Mode Selector */}
      <ModeSelector 
        selectedMode={selectedMode} 
        onModeChange={setSelectedMode}
        disabled={isEnhancing}
      />

      {/* Interactive Input Bar */}
      <PromptInput 
        onSubmit={handleSubmit} 
        isLoading={isEnhancing}
        initialValue={inputValue}
        key={inputValue} // Reset component when inputValue changes from history
      />

      {/* Error State */}
      {showError && (
        <ErrorState 
          error={error}
          errorType={errorType}
          onRetry={retry}
          retryCount={retryCount}
        />
      )}

      {/* Loading Skeleton (only when no content is streaming yet) */}
      {showLoadingSkeleton && (
        <LoadingSkeleton stage={loadingStage} />
      )}

      {/* Enhanced Result (shows during streaming and after completion) */}
      {showResult && (
        <EnhancedResult 
          content={enhancedPrompt} 
          isLoading={isEnhancing} 
          onReset={clearEnhanced}
          onRegenerate={regenerate}
          mode={lastMode}
        />
      )}

      {/* Prompt Builder Modal */}
      <PromptBuilderModal
        open={isBuilderOpen}
        onOpenChange={setIsBuilderOpen}
        onInsertPrompt={(prompt) => setInputValue(prompt)}
      />
    </section>
  );
}
