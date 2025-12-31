import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Maximize2,
  AlertTriangle,
  Terminal,
  Box,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface LivePreviewProps {
  code: string;
  isLoading?: boolean; // Ez jelzi, ha épp streamel a generátor
  theme?: "light" | "dark";
}

// Segédfüggvény a debounce-hoz
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export function LivePreview({
  code,
  isLoading,
  theme = "dark",
}: LivePreviewProps) {
  const [key, setKey] = useState(0);
  const [runtimeError, setRuntimeError] = useState<string | null>(null);

  // Csak akkor frissítjük a kódot a preview-ban, ha a user megállt az írással/generálással,
  // VAGY ha a generálás véget ért (isLoading = false).
  // Streaming közben 1mp-es debounce-t használunk, hogy ne villogjon.
  const debouncedCode = useDebounce(code, isLoading ? 1000 : 300);

  // Ha véget ért a töltés, azonnal frissítsen (bypass debounce)
  const codeToRender = isLoading ? debouncedCode : code;

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Biztonsági ellenőrzés: csak az iframe-ből jövő üzeneteket figyeljük
      if (!event.data || typeof event.data !== "object") return;

      if (event.data.type === "preview-error") {
        setRuntimeError(event.data.error);
        console.error("Preview Error:", event.data.error);
      } else if (event.data.type === "preview-success") {
        setRuntimeError(null);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleRefresh = useCallback(() => {
    setKey((prev) => prev + 1);
    setRuntimeError(null);
  }, []);

  // 1. Biztonsági szűrés (Basic Sanity Check)
  const isCodeSafe = useMemo(() => {
    if (!codeToRender) return true;
    const dangerousPatterns = [
      /eval\s*\(/,
      /document\.cookie/i,
      /localStorage/i,
      /sessionStorage/i,
      /indexedDB/i,
      /javascript:/gi,
    ];
    return !dangerousPatterns.some((pattern) => pattern.test(codeToRender));
  }, [codeToRender]);

  // 2. HTML Generálás (Import Maps + Babel Error Catching)
  const htmlContent = useMemo(() => {
    if (!codeToRender) return "";
    if (!isCodeSafe) return getSecurityErrorHTML(theme);

    const bgColor = theme === "dark" ? "#0a0a0a" : "#ffffff";
    const textColor = theme === "dark" ? "#fafafa" : "#0a0a0a";

    // Ez a trükk lehetővé teszi, hogy a generált kód "export default"-ját elkapjuk
    // anélkül, hogy regex-szel találnánk ki a komponens nevét.
    // A kódot átalakítjuk, hogy a végén hozzárendelje a window-hoz a komponenst.
    const transformCode = (rawCode: string) => {
      // Regex a "export default function X" vagy "export default X" eltávolítására
      // és helyette egy lokális változó + window assignment
      let processed = rawCode
        .replace(/import\s+[\s\S]*?from\s+['"].*['"];?/g, "") // Importokat kiszedjük (Babel kezeli vagy Globals)
        .replace(/export\s+default\s+function\s+(\w+)/, "function $1")
        .replace(/export\s+default\s+const\s+(\w+)/, "const $1")
        .replace(/export\s+default\s+(\w+)/, "");

      // Megkeressük az exportált nevet, ha van
      const match =
        rawCode.match(/export\s+default\s+(?:function\s+)?(\w+)/) ||
        rawCode.match(/const\s+(\w+)\s*=\s*.*export\s+default\s+\1/);

      const compName = match ? match[1] : "App";

      return `${processed}\n\n// Mount logic\nif (typeof ${compName} !== 'undefined') { window.RenderComponent = ${compName}; }`;
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- 1. Tailwind (CDN for simplicity in preview) -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = { darkMode: 'class', theme: { extend: { colors: { border: "hsl(var(--border))", background: "hsl(var(--background))", foreground: "hsl(var(--foreground))" } } } }
  </script>

  <!-- 2. React & Dependencies via UMD for stability in raw IFrame without bundler -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/lucide-react@latest"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <!-- 3. Error Reporting & Styles -->
  <style>
    body { background-color: ${bgColor}; color: ${textColor}; margin: 0; font-family: sans-serif; overflow-x: hidden; }
    #root { min-height: 100vh; display: flex; flex-direction: column; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-thumb { background: #525252; border-radius: 3px; }
  </style>

  <script>
    window.onerror = function(msg, url, line, col, error) {
      window.parent.postMessage({ type: 'preview-error', error: msg }, '*');
      return false;
    };

    // Lucide Icon Proxy (mivel a generált kód gyakran importálja)
    window.lucide = window.lucide || {};
    // Globals beállítása, hogy a generált kód megtalálja a React hookokat "React." előtag nélkül is, ha úgy íródott
    Object.assign(window, React);
  </script>
</head>
<body>
  <div id="root"></div>

  <script type="text/babel" data-presets="react,typescript">
    try {
      // Itt injektáljuk a felhasználó kódját
      ${transformCode(codeToRender)}

      // Renderelés
      if (window.RenderComponent) {
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(window.RenderComponent));
        // Siker jelzése
        window.parent.postMessage({ type: 'preview-success' }, '*');
      } else {
        throw new Error("Nem található exportált komponens. Kérlek használd az 'export default' parancsot.");
      }
    } catch (err) {
      window.parent.postMessage({ type: 'preview-error', error: err.message }, '*');
    }
  </script>
</body>
</html>`;
  }, [codeToRender, theme, isCodeSafe]);

  // --- Render UI ---

  return (
    <div className="flex flex-col h-full bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden shadow-2xl">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-900 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
          <div className="h-4 w-[1px] bg-neutral-800 mx-1" />
          <span className="text-xs font-medium text-neutral-400 flex items-center gap-2">
            <Box className="w-3.5 h-3.5" />
            Preview
          </span>
          {isLoading && (
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full animate-pulse">
              Generating
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          className="h-7 w-7 text-neutral-400 hover:text-white hover:bg-neutral-800"
          title="Reload Preview"
        >
          <RefreshCw
            className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
          />
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative bg-neutral-950/50">
        {!isCodeSafe ? (
          <ErrorState
            icon={AlertTriangle}
            title="Biztonsági Figyelmeztetés"
            desc="A kód nem biztonságos mintákat tartalmaz (pl. eval, cookie hozzáférés)."
          />
        ) : runtimeError ? (
          <div className="absolute inset-0 z-10 bg-neutral-950/90 backdrop-blur-sm p-6 flex flex-col items-center justify-center animate-in fade-in">
            <div className="max-w-md w-full bg-red-950/20 border border-red-900/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-400 mb-2 font-semibold text-sm">
                <Terminal className="w-4 h-4" />
                Runtime Error
              </div>
              <pre className="text-xs text-red-300/90 font-mono whitespace-pre-wrap break-words bg-black/40 p-3 rounded border border-red-900/30">
                {runtimeError}
              </pre>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                className="mt-4 w-full border-red-900/30 hover:bg-red-950/30 text-red-400 hover:text-red-300"
              >
                <RefreshCw className="w-3 h-3 mr-2" />
                Újrapróbálás
              </Button>
            </div>
          </div>
        ) : null}

        {codeToRender ? (
          <iframe
            key={key} // Key váltás kényszeríti az újratöltést
            srcDoc={htmlContent}
            className={cn(
              "w-full h-full border-0 transition-opacity duration-300",
              runtimeError ? "opacity-20 pointer-events-none" : "opacity-100",
            )}
            sandbox="allow-scripts allow-modals allow-same-origin" // allow-same-origin szükséges a fontokhoz néha, de srcDoc-nál biztonságosabb
            title="Preview"
          />
        ) : (
          <ErrorState
            icon={Maximize2}
            title="Üres vászon"
            desc="Generálj egy komponenst a megtekintéshez."
            neutral
          />
        )}
      </div>
    </div>
  );
}

// Külön komponens az üres/hiba állapotoknak a tisztább kódért
function ErrorState({
  icon: Icon,
  title,
  desc,
  neutral,
}: {
  icon: any;
  title: string;
  desc: string;
  neutral?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in zoom-in-95 duration-300">
      <div
        className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center mb-4 ring-1 ring-inset",
          neutral
            ? "bg-neutral-900 ring-neutral-800 text-neutral-500"
            : "bg-red-950/30 ring-red-900/30 text-red-400",
        )}
      >
        <Icon className="w-6 h-6 opacity-80" />
      </div>
      <h3
        className={cn(
          "text-sm font-medium mb-1",
          neutral ? "text-neutral-300" : "text-red-400",
        )}
      >
        {title}
      </h3>
      <p className="text-xs text-neutral-500 max-w-[200px]">{desc}</p>
    </div>
  );
}

function getSecurityErrorHTML(theme: string) {
  return `<html><body style="background:${theme === "dark" ? "#000" : "#fff"};color:red;display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;">Security Blocked</body></html>`;
}
