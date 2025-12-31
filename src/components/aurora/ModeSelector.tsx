import { Briefcase, Palette, Code, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

export type EnhanceMode = "formal" | "creative" | "technical" | "marketing";

interface ModeSelectorProps {
  selectedMode: EnhanceMode;
  onModeChange: (mode: EnhanceMode) => void;
  disabled?: boolean;
}

export function ModeSelector({ selectedMode, onModeChange, disabled }: ModeSelectorProps) {
  const { t } = useLanguage();

  const MODES: { id: EnhanceMode; labelKey: keyof typeof t; icon: typeof Briefcase; descKey: keyof typeof t }[] = [
    { id: "formal", labelKey: "formal", icon: Briefcase, descKey: "formalDesc" },
    { id: "creative", labelKey: "creative", icon: Palette, descKey: "creativeDesc" },
    { id: "technical", labelKey: "technical", icon: Code, descKey: "technicalDesc" },
    { id: "marketing", labelKey: "marketing", icon: Megaphone, descKey: "marketingDesc" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-6">
      <p className="text-sm text-muted-foreground mb-3 text-center">{t.selectStyle}</p>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
        {MODES.map((mode) => {
          const Icon = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              disabled={disabled}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                "border disabled:opacity-50 disabled:cursor-not-allowed",
                isSelected
                  ? "bg-gradient-to-r from-aurora-purple to-aurora-pink text-white border-transparent shadow-lg shadow-aurora-purple/30"
                  : "bg-surface-dark-elevated text-muted-foreground border-border/50 hover:border-aurora-purple/50 hover:text-foreground"
              )}
              title={t[mode.descKey] as string}
            >
              <Icon className="w-4 h-4" />
              <span>{t[mode.labelKey] as string}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
