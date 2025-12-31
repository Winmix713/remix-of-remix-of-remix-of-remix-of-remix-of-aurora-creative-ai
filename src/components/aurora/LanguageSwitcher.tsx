import { useLanguage, Language } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "EN", flag: "🇬🇧" },
    { code: "hu", label: "HU", flag: "🇭🇺" },
  ];

  return (
    <div className="flex items-center gap-1 bg-surface-dark-elevated rounded-full p-1">
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            language === lang.code
              ? "bg-gradient-to-r from-aurora-purple to-aurora-pink text-white shadow-md"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <span>{lang.flag}</span>
          <span className="hidden sm:inline">{lang.label}</span>
        </button>
      ))}
    </div>
  );
}
