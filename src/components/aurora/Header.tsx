import { ArrowRight, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card/70 backdrop-blur-lg sticky top-0 border-b border-border/60 z-50 transition-all">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-aurora-purple to-aurora-pink p-[2px] shadow-sm">
          <div className="h-full w-full bg-card rounded-[9px] flex items-center justify-center">
            <FlaskConical className="w-6 h-6 text-aurora-purple" />
          </div>
        </div>
        <span className="font-bold text-lg tracking-tight hidden sm:block">{t.appName}</span>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground" aria-label="Main Navigation">
        <a href="#" className="text-foreground hover:text-aurora-purple transition-colors">{t.create}</a>
        <a href="#" className="hover:text-foreground transition-colors">{t.library}</a>
        <a href="#" className="hover:text-foreground transition-colors">{t.explore}</a>
        <a href="#" className="hover:text-foreground transition-colors">{t.pricing}</a>
      </nav>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <Button variant="ghost" className="hidden sm:block text-foreground text-sm font-semibold">
          {t.signIn}
        </Button>
        <Button className="bg-foreground text-background px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold hover:bg-foreground/90 hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md">
          <span>{t.getApp}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
