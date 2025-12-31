import { FeatureCard } from "./FeatureCard";
import { useLanguage } from "@/contexts/LanguageContext";

export function FeaturesSection() {
  const { t } = useLanguage();

  const features = [
    {
      emoji: "📝",
      emojiLabel: t.largeTexts,
      title: t.largeTexts,
      description: t.largeTextsDesc,
      bgColorClass: "bg-blue-50",
    },
    {
      emoji: "📎",
      emojiLabel: t.fileUpload,
      title: t.fileUpload,
      description: t.fileUploadDesc,
      bgColorClass: "bg-emerald-50",
    },
    {
      emoji: "✨",
      emojiLabel: t.proPrompt,
      title: t.proPrompt,
      description: t.proPromptDesc,
      bgColorClass: "bg-purple-50",
    },
    {
      emoji: "🚀",
      emojiLabel: t.instantResult,
      title: t.instantResult,
      description: t.instantResultDesc,
      bgColorClass: "bg-orange-50",
    },
  ];

  return (
    <section className="w-full px-4 mb-20">
      <div className="max-w-7xl mx-auto rounded-[2.5rem] bg-card/50 backdrop-blur-xl border border-card/60 p-6 md:p-12 lg:p-16 shadow-2xl shadow-muted/50">
        <div className="mb-10 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{t.howItWorks}</h2>
          <p className="text-muted-foreground text-lg">{t.simpleUsage}</p>
        </div>

        {/* Hybrid Layout: Flex/Scroll on Mobile -> Grid on Desktop */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0 scroll-smooth no-scrollbar">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
