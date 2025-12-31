import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download, FileCode2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CodePreviewProps {
  code: string;
  isLoading?: boolean;
}

export function CodePreview({ code, isLoading }: CodePreviewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!code) return;
    
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleDownload = () => {
    if (!code) return;
    
    const blob = new Blob([code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "GeneratedComponent.tsx";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Component downloaded!");
  };

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    if (!code) return "";
    
    return code
      // Keywords
      .replace(/\b(import|export|default|const|let|var|function|return|if|else|for|while|class|extends|interface|type|from|as)\b/g, '<span class="text-fuchsia-400">$1</span>')
      // Strings
      .replace(/(["'`])(?:(?!\1)[^\\]|\\.)*\1/g, '<span class="text-emerald-300">$&</span>')
      // JSX tags
      .replace(/(&lt;\/?)([A-Z][a-zA-Z0-9]*)/g, '$1<span class="text-sky-400">$2</span>')
      .replace(/(<\/?)([A-Z][a-zA-Z0-9]*)/g, '$1<span class="text-sky-400">$2</span>')
      // HTML elements
      .replace(/(&lt;\/?)([a-z][a-z0-9]*)/g, '$1<span class="text-orange-400">$2</span>')
      .replace(/(<\/?)([a-z][a-z0-9]*)/g, '$1<span class="text-orange-400">$2</span>')
      // Comments
      .replace(/(\/\/.*$)/gm, '<span class="text-neutral-500">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="text-neutral-500">$1</span>')
      // Numbers
      .replace(/\b(\d+)\b/g, '<span class="text-amber-400">$1</span>')
      // className attribute
      .replace(/(className)=/g, '<span class="text-violet-400">$1</span>=');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800 bg-neutral-950/90">
        <div className="flex items-center gap-2">
          <FileCode2 className="h-4 w-4 text-neutral-400" />
          <span className="text-[0.75rem] font-medium text-neutral-300">GeneratedComponent.tsx</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!code}
            className="h-7 px-2 text-[0.7rem] text-neutral-400 hover:text-neutral-100"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            disabled={!code}
            className="h-7 px-2 text-[0.7rem] text-neutral-400 hover:text-neutral-100"
          >
            <Download className="h-3.5 w-3.5 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Code area */}
      <div className="flex-1 overflow-auto bg-neutral-950 p-3">
        {isLoading && !code ? (
          <div className="flex flex-col gap-2 animate-pulse">
            <div className="h-4 w-48 bg-neutral-800 rounded" />
            <div className="h-4 w-64 bg-neutral-800 rounded" />
            <div className="h-4 w-40 bg-neutral-800 rounded" />
            <div className="h-4 w-72 bg-neutral-800 rounded" />
            <div className="h-4 w-56 bg-neutral-800 rounded" />
          </div>
        ) : code ? (
          <pre className="text-[0.75rem] leading-relaxed font-mono whitespace-pre-wrap">
            <code 
              className="text-neutral-300"
              dangerouslySetInnerHTML={{ __html: highlightCode(code) }}
            />
          </pre>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500 text-sm">
            <FileCode2 className="h-8 w-8 mb-2 opacity-50" />
            <p>No code generated yet</p>
            <p className="text-xs mt-1">Click "Generate Component" to create code</p>
          </div>
        )}
        
        {isLoading && code && (
          <div className="mt-2 flex items-center gap-2 text-[0.7rem] text-neutral-500">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Generating...
          </div>
        )}
      </div>
    </div>
  );
}
