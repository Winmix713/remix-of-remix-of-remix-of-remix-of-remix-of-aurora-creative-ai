interface FeatureCardProps {
  emoji: string;
  emojiLabel: string;
  title: string;
  description: string;
  bgColorClass: string;
}

export function FeatureCard({ emoji, emojiLabel, title, description, bgColorClass }: FeatureCardProps) {
  return (
    <article className="snap-center min-w-[85%] sm:min-w-[350px] lg:min-w-0 bg-card rounded-2xl p-8 border border-border/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-12 h-12 rounded-xl ${bgColorClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        <span className="text-2xl" role="img" aria-label={emojiLabel}>{emoji}</span>
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </article>
  );
}
