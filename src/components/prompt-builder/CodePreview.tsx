import { useState, useMemo, useCallback, useEffect } from "react";
import { Copy, Check, Download, FileCode2, Maximize2, Minimize2 } from "lucide-react";

interface CodePreviewProps {
  code: string;
  isLoading?: boolean;
  fileName?: string;
  language?: "typescript" | "javascript" | "tsx" | "jsx";
  maxHeight?: string;
  showLineNumbers?: boolean;
}

export function CodePreview({
  code,
  isLoading,
  fileName = "GeneratedComponent",
  language = "tsx",
  maxHeight = "600px",
  showLineNumbers = true,
}: CodePreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fullFileName = `${fileName}.${language}`;

  // Toast notification system
  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Simple syntax highlighting with proper escaping
  const highlightedCode = useMemo(() => {
    if (!code) return "";

    try {
      // Escape HTML entities
      const escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

      // Apply basic syntax highlighting
      return escaped
        .replace(/\b(import|export|from|const|let|var|function|return|if|else|for|while|class|interface|type|extends|implements)\b/g, '<span class="keyword">$1</span>')
        .replace(/\b(true|false|null|undefined)\b/g, '<span class="boolean">$1</span>')
        .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
        .replace(/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g, '<span class="string">$1$2$1</span>')
        .replace(/\/\/.*/g, '<span class="comment">$&</span>')
        .replace(/\/\*[\s\S]*?\*\//g, '<span class="comment">$&</span>');
    } catch (error) {
      console.error("Syntax highlighting failed:", error);
      return code.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
  }, [code, language]);

  // Generate line numbers
  const lineNumbers = useMemo(() => {
    if (!code || !showLineNumbers) return [];
    return code.split('\n').map((_, i) => i + 1);
  }, [code, showLineNumbers]);

  // Handle copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      showToast("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Failed to copy code", "error");
    }
  }, [code, showToast]);

  // Handle file download
  const handleDownload = useCallback(() => {
    if (!code) return;

    const mimeTypes: Record<string, string> = {
      typescript: "text/typescript",
      tsx: "text/typescript",
      javascript: "text/javascript",
      jsx: "text/javascript",
    };

    try {
      const blob = new Blob([code], { type: mimeTypes[language] || "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fullFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast(`${fullFileName} downloaded successfully`);
    } catch {
      showToast("Download failed", "error");
    }
  }, [code, fullFileName, language, showToast]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Handle escape key for fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isFullscreen]);

  return (
    <>
      <style>{`
        .code-preview-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: system-ui, -apple-system, sans-serif;
          background: #0d1117;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #30363d;
        }

        .code-preview-fullscreen {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          border-radius: 0;
        }

        .code-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 16px;
          background: #161b22;
          border-bottom: 1px solid #30363d;
        }

        .code-file-info {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8b949e;
        }

        .code-file-name {
          font-size: 13px;
          font-weight: 500;
          font-family: 'Monaco', 'Courier New', monospace;
          color: #c9d1d9;
        }

        .code-actions {
          display: flex;
          gap: 6px;
        }

        .code-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: transparent;
          border: 1px solid #30363d;
          border-radius: 6px;
          color: #8b949e;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-family: system-ui;
        }

        .code-btn:hover:not(:disabled) {
          background: #21262d;
          border-color: #8b949e;
          color: #c9d1d9;
        }

        .code-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .code-btn-success {
          border-color: #238636;
          color: #3fb950;
        }

        .code-content {
          flex: 1;
          overflow: auto;
          background: #0d1117;
          position: relative;
        }

        .code-content::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }

        .code-content::-webkit-scrollbar-track {
          background: #0d1117;
        }

        .code-content::-webkit-scrollbar-thumb {
          background: #30363d;
          border-radius: 5px;
        }

        .code-content::-webkit-scrollbar-thumb:hover {
          background: #484f58;
        }

        .code-loading {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 20px;
        }

        .code-loading-line {
          height: 16px;
          background: #161b22;
          border-radius: 4px;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .code-pre-wrapper {
          display: flex;
          padding: 20px 0;
          margin: 0;
          font-family: 'Monaco', 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
        }

        .code-line-numbers {
          padding: 0 16px;
          text-align: right;
          color: #6e7681;
          user-select: none;
          border-right: 1px solid #30363d;
          min-width: 50px;
        }

        .code-pre {
          flex: 1;
          padding: 0 20px;
          margin: 0;
          overflow: visible;
          white-space: pre;
          color: #c9d1d9;
        }

        .code-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #6e7681;
          gap: 8px;
        }

        .code-status {
          position: absolute;
          bottom: 16px;
          right: 16px;
          background: rgba(22, 27, 34, 0.95);
          border: 1px solid #30363d;
          padding: 8px 16px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #3fb950;
          backdrop-filter: blur(10px);
        }

        .code-status-pulse {
          width: 8px;
          height: 8px;
          background: #3fb950;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: #161b22;
          border: 1px solid #30363d;
          padding: 12px 20px;
          border-radius: 6px;
          color: #c9d1d9;
          font-size: 14px;
          z-index: 10000;
          animation: slideIn 0.3s ease-out;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .toast-success {
          border-color: #238636;
        }

        .toast-error {
          border-color: #da3633;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .keyword { color: #ff7b72; }
        .string { color: #a5d6ff; }
        .number { color: #79c0ff; }
        .boolean { color: #79c0ff; }
        .comment { color: #8b949e; font-style: italic; }
      `}</style>

      <div className={`code-preview-container ${isFullscreen ? 'code-preview-fullscreen' : ''}`}
           style={!isFullscreen ? { maxHeight } : {}}>
        <div className="code-header">
          <div className="code-file-info">
            <FileCode2 size={16} style={{ color: '#3fb950' }} />
            <span className="code-file-name">{fullFileName}</span>
          </div>
          <div className="code-actions">
            <button
              className={`code-btn ${copied ? 'code-btn-success' : ''}`}
              onClick={handleCopy}
              disabled={!code}
              aria-label="Copy code"
            >
              {copied ? (
                <>
                  <Check size={14} />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={14} />
                  Copy
                </>
              )}
            </button>
            <button
              className="code-btn"
              onClick={handleDownload}
              disabled={!code}
              aria-label="Download file"
            >
              <Download size={14} />
              Download
            </button>
            <button
              className="code-btn"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        <div className="code-content">
          {isLoading && !code ? (
            <div className="code-loading">
              <div className="code-loading-line" style={{ width: '60%' }} />
              <div className="code-loading-line" style={{ width: '80%' }} />
              <div className="code-loading-line" style={{ width: '50%' }} />
              <div className="code-loading-line" style={{ width: '90%' }} />
            </div>
          ) : code ? (
            <div className="code-pre-wrapper">
              {showLineNumbers && (
                <div className="code-line-numbers">
                  {lineNumbers.map(num => (
                    <div key={num}>{num}</div>
                  ))}
                </div>
              )}
              <pre className="code-pre">
                <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
              </pre>
            </div>
          ) : (
            <div className="code-empty">
              <FileCode2 size={48} style={{ opacity: 0.3 }} />
              <p>No code generated yet</p>
              <p style={{ fontSize: '12px', opacity: 0.6 }}>
                Generate a component to view source
              </p>
            </div>
          )}

          {isLoading && code && (
            <div className="code-status">
              <span className="code-status-pulse" />
              Regenerating...
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </>
  );
}