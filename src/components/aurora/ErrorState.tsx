import { AlertTriangle, RefreshCw, Wifi, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  errorType?: "network" | "rate-limit" | "payment" | "generic";
  onRetry?: () => void;
  retryCount?: number;
}

export function ErrorState({ error, errorType = "generic", onRetry, retryCount = 0 }: ErrorStateProps) {
  const errorConfig = {
    network: {
      icon: Wifi,
      title: "Connection Issue",
      description: "Unable to reach Aurora AI. Please check your internet connection.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    "rate-limit": {
      icon: Clock,
      title: "Too Many Requests",
      description: "You've reached the rate limit. Please wait a moment before trying again.",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    payment: {
      icon: CreditCard,
      title: "Credits Needed",
      description: "You've used all your AI credits. Add more credits to continue enhancing prompts.",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    generic: {
      icon: AlertTriangle,
      title: "Something Went Wrong",
      description: error || "An unexpected error occurred. Please try again.",
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  };

  const config = errorConfig[errorType];
  const Icon = config.icon;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 bg-card/90 backdrop-blur-xl rounded-3xl border border-destructive/30 shadow-xl overflow-hidden animate-fade-in">
      <div className="p-8 text-center">
        <div className={`w-16 h-16 mx-auto rounded-full ${config.bgColor} flex items-center justify-center mb-4`}>
          <Icon className={`w-8 h-8 ${config.color}`} />
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">{config.title}</h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">{config.description}</p>
        
        {onRetry && errorType !== "payment" && (
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={onRetry}
              className="bg-gradient-to-r from-aurora-purple to-aurora-pink text-white hover:opacity-90"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            {retryCount > 0 && (
              <span className="text-xs text-muted-foreground">
                Retry attempt {retryCount}/3
              </span>
            )}
          </div>
        )}
        
        {errorType === "payment" && (
          <Button
            asChild
            className="bg-gradient-to-r from-aurora-purple to-aurora-pink text-white hover:opacity-90"
          >
            <a href="https://lovable.dev/settings" target="_blank" rel="noopener noreferrer">
              <CreditCard className="w-4 h-4 mr-2" />
              Add Credits
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
