import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="w-full pb-10 pt-6">
      <div className="flex flex-col items-center gap-6">
        <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground font-medium">
          <a href="#" className="hover:text-aurora-purple transition-colors">{t.pricing}</a>
          <span className="text-border" aria-hidden="true">•</span>
          <a href="#" className="hover:text-aurora-purple transition-colors">{t.updates}</a>
          <span className="text-border" aria-hidden="true">•</span>
          <a href="#" className="hover:text-aurora-purple transition-colors">{t.privacyPolicy}</a>
          <span className="text-border" aria-hidden="true">•</span>
          <a href="#" className="hover:text-aurora-purple transition-colors">{t.terms}</a>
        </div>
        <p className="text-xs text-muted-foreground/60">{t.copyright}</p>
      </div>
    </footer>
  );
}
