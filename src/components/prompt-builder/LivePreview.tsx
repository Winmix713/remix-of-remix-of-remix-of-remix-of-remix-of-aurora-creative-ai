import { useMemo, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Maximize2, ExternalLink, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LivePreviewProps {
  code: string;
  isLoading?: boolean;
  theme?: "light" | "dark";
}

export function LivePreview({ code, isLoading, theme = "dark" }: LivePreviewProps) {
  const [key, setKey] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Reset error state when code changes
  useEffect(() => {
    setHasError(false);
  }, [code]);

  const htmlContent = useMemo(() => {
    if (!code) return "";

    // Create a simple HTML wrapper that renders the React component
    const bgColor = theme === "dark" ? "#0a0a0a" : "#ffffff";
    const textColor = theme === "dark" ? "#fafafa" : "#0a0a0a";

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      background: ${bgColor}; 
      color: ${textColor};
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
    }
    #root { min-height: 100vh; }
    .error-display {
      padding: 20px;
      color: #f87171;
      font-family: monospace;
      font-size: 12px;
      white-space: pre-wrap;
    }
  </style>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          animation: {
            'fade-in': 'fadeIn 0.5s ease-out',
            'slide-up': 'slideUp 0.5s ease-out',
            'scale-in': 'scaleIn 0.5s ease-out',
          },
          keyframes: {
            fadeIn: {
              '0%': { opacity: '0' },
              '100%': { opacity: '1' },
            },
            slideUp: {
              '0%': { opacity: '0', transform: 'translateY(20px)' },
              '100%': { opacity: '1', transform: 'translateY(0)' },
            },
            scaleIn: {
              '0%': { opacity: '0', transform: 'scale(0.95)' },
              '100%': { opacity: '1', transform: 'scale(1)' },
            },
          },
        },
      },
    }
  </script>
</head>
<body class="${theme === "dark" ? "dark" : ""}">
  <div id="root"></div>
  <script type="text/babel" data-presets="react,typescript">
    ${code}

    try {
      // Try to find the default export or a named component
      const componentCode = \`${code.replace(/`/g, "\\`").replace(/\$/g, "\\$")}\`;
      
      // Extract component name from export default
      const defaultMatch = componentCode.match(/export\\s+default\\s+(?:function\\s+)?(\\w+)/);
      const namedMatch = componentCode.match(/(?:function|const)\\s+(\\w+)/);
      
      const App = typeof GeneratedComponent !== 'undefined' ? GeneratedComponent :
                  typeof Component !== 'undefined' ? Component :
                  typeof HeroSection !== 'undefined' ? HeroSection :
                  typeof Hero !== 'undefined' ? Hero :
                  typeof Features !== 'undefined' ? Features :
                  typeof FeaturesSection !== 'undefined' ? FeaturesSection :
                  null;
      
      if (App) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(App));
      } else {
        document.getElementById('root').innerHTML = '<div class="error-display">Could not find component to render</div>';
      }
    } catch (error) {
      document.getElementById('root').innerHTML = '<div class="error-display">Error: ' + error.message + '</div>';
      window.parent.postMessage({ type: 'preview-error', error: error.message }, '*');
    }
  </script>
</body>
</html>`;
  }, [code, theme]);

  const handleRefresh = () => {
    setKey(prev => prev + 1);
    setHasError(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-950/90">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
          </div>
          <span className="text-[0.75rem] font-medium text-neutral-400">Live Preview</span>
          {isLoading && (
            <span className="inline-flex items-center gap-1 text-[0.65rem] text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Updating...
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={!code}
            className="h-7 px-2 text-[0.7rem] text-neutral-400 hover:text-neutral-100"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Preview area */}
      <div className={cn(
        "flex-1 overflow-hidden",
        theme === "dark" ? "bg-neutral-950" : "bg-white"
      )}>
        {hasError ? (
          <div className="flex flex-col items-center justify-center h-full text-red-400 p-4">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p className="text-sm font-medium">Preview Error</p>
            <p className="text-xs text-neutral-500 mt-1">The component could not be rendered</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="mt-3 text-xs"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        ) : code ? (
          <iframe
            key={key}
            srcDoc={htmlContent}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
            title="Component Preview"
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-sm">
            <Maximize2 className="h-8 w-8 mb-2 opacity-50" />
            <p>No preview available</p>
            <p className="text-xs mt-1">Generate a component to see the live preview</p>
          </div>
        )}
      </div>
    </div>
  );
}
