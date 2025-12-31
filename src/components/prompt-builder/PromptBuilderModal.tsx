import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, RotateCcw, HelpCircle, Sparkles, Clock, ChevronDown, FileText, Code2, Moon, Sun, Plus, Copy, Wand2, PlayCircle, LayoutTemplate, PlusCircle, Check, Eye, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodePreview } from "./CodePreview";
import { LivePreview } from "./LivePreview";
import { RefinementChat } from "./RefinementChat";
import { useGenerateComponent, type ComponentConfig } from "@/hooks/useGenerateComponent";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface PromptBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInsertPrompt?: (prompt: string) => void;
}

type BuilderMode = "prompt" | "generate";
type PreviewMode = "preview" | "code";
type LayoutType = "hero" | "features" | "onboarding" | "docs";
type LayoutConfig = "card" | "list" | "grid";
type FramingType = "fullscreen" | "card" | "browser";
type StyleType = "flat" | "outline" | "glass";
type ThemeType = "light" | "dark";
type AccentColor = "emerald" | "sky" | "indigo" | "fuchsia";
type TypefaceType = "sans" | "serif" | "mono";
type AnimationType = "fade" | "slide" | "scale";
type PlatformType = "web" | "mobile";

interface GeneratedPromptItem {
  id: string;
  category: string;
  text: string;
}

export function PromptBuilderModal({ open, onOpenChange, onInsertPrompt }: PromptBuilderModalProps) {
  const [builderMode, setBuilderMode] = useState<BuilderMode>("prompt");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("preview");
  const [platform, setPlatform] = useState<PlatformType>("web");
  const [layoutType, setLayoutType] = useState<LayoutType>("hero");
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig | null>(null);
  const [framing, setFraming] = useState<FramingType | null>(null);
  const [style, setStyle] = useState<StyleType>("flat");
  const [theme, setTheme] = useState<ThemeType>("dark");
  const [accent, setAccent] = useState<AccentColor>("emerald");
  const [typeface, setTypeface] = useState<TypefaceType>("sans");
  const [animations, setAnimations] = useState<AnimationType[]>(["fade"]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [customPrompts, setCustomPrompts] = useState<string[]>([]);

  const { generatedCode, isGenerating, generateComponent, reset: resetGeneration } = useGenerateComponent();

  // Generate dynamic prompt items based on selections
  const generatedPrompts = useMemo<GeneratedPromptItem[]>(() => {
    const items: GeneratedPromptItem[] = [];
    
    // Layout Type
    items.push({
      id: "layout-type",
      category: "Layout Type",
      text: `Create a ${layoutType} layout section for ${platform} application.`
    });

    // Layout Configuration
    if (layoutConfig) {
      items.push({
        id: "layout-config",
        category: "Layout Config",
        text: `Use a ${layoutConfig} configuration for content organization.`
      });
    }

    // Framing
    if (framing) {
      const framingDescriptions: Record<FramingType, string> = {
        fullscreen: "Display as a full-screen immersive section.",
        card: "Frame the content inside a card container with rounded corners.",
        browser: "Show the content inside a browser window mockup frame."
      };
      items.push({
        id: "framing",
        category: "Framing",
        text: framingDescriptions[framing]
      });
    }

    // Style
    const styleDescriptions: Record<StyleType, string> = {
      flat: "Use a flat, minimal design style with solid colors and clean edges.",
      outline: "Use an outline style with border strokes and transparent backgrounds.",
      glass: "Apply glassmorphism effect with blur, transparency and subtle borders."
    };
    items.push({
      id: "style",
      category: "Style",
      text: styleDescriptions[style]
    });

    // Theme
    items.push({
      id: "theme",
      category: "Theme",
      text: theme === "dark" 
        ? "Use a dark theme with dark backgrounds and light text for a modern, professional look."
        : "Use a light theme with white/light backgrounds and dark text for a clean, bright appearance."
    });

    // Accent
    const accentDescriptions: Record<AccentColor, string> = {
      emerald: "Use emerald/green as the primary accent color for buttons and highlights.",
      sky: "Use sky blue as the primary accent color for buttons and highlights.",
      indigo: "Use indigo/purple-blue as the primary accent color for buttons and highlights.",
      fuchsia: "Use fuchsia/pink as the primary accent color for buttons and highlights."
    };
    items.push({
      id: "accent",
      category: "Accent",
      text: accentDescriptions[accent]
    });

    // Typeface
    const typefaceDescriptions: Record<TypefaceType, string> = {
      sans: "Use a clean sans-serif typeface like Inter for modern, readable typography.",
      serif: "Use an elegant serif typeface for a classic, editorial feel.",
      mono: "Use a monospace typeface for a technical, code-like aesthetic."
    };
    items.push({
      id: "typeface",
      category: "Typeface",
      text: typefaceDescriptions[typeface]
    });

    // Animations
    if (animations.length > 0) {
      const animDescs = animations.map(a => {
        if (a === "fade") return "fade-in";
        if (a === "slide") return "slide-up";
        if (a === "scale") return "scale-in";
        return a;
      });
      items.push({
        id: "animations",
        category: "Animation",
        text: `Apply ${animDescs.join(", ")} animations for smooth entrance effects.`
      });
    }

    // Custom prompts
    customPrompts.forEach((cp, index) => {
      items.push({
        id: `custom-${index}`,
        category: "Custom",
        text: cp
      });
    });

    return items;
  }, [platform, layoutType, layoutConfig, framing, style, theme, accent, typeface, animations, customPrompts]);

  const handleReset = () => {
    setPlatform("web");
    setLayoutType("hero");
    setLayoutConfig(null);
    setFraming(null);
    setStyle("flat");
    setTheme("dark");
    setAccent("emerald");
    setTypeface("sans");
    setAnimations(["fade"]);
    setSelectedPromptIds([]);
    setCustomPrompt("");
    setCustomPrompts([]);
    resetGeneration();
  };

  const toggleAnimation = (anim: AnimationType) => {
    setAnimations((prev) =>
      prev.includes(anim) ? prev.filter((a) => a !== anim) : [...prev, anim]
    );
  };

  const togglePromptSelection = (id: string) => {
    setSelectedPromptIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAllPrompts = () => {
    setSelectedPromptIds(generatedPrompts.map(p => p.id));
  };

  const addCustomPrompt = () => {
    if (customPrompt.trim()) {
      setCustomPrompts([...customPrompts, customPrompt.trim()]);
      setCustomPrompt("");
    }
  };

  const getSelectedPromptsText = () => {
    return generatedPrompts
      .filter(p => selectedPromptIds.includes(p.id))
      .map(p => p.text)
      .join(" ");
  };

  const handleAddToMainPrompt = () => {
    const finalPrompt = getSelectedPromptsText();
    if (finalPrompt) {
      onInsertPrompt?.(finalPrompt);
      onOpenChange(false);
    }
  };

  const handleGenerateComponent = () => {
    const config: ComponentConfig = {
      platform,
      layoutType,
      layoutConfig,
      framing,
      style,
      theme,
      accent,
      typeface,
      animations,
      customPrompts,
    };
    generateComponent(config);
  };

  const handleRefine = (instruction: string) => {
    if (!generatedCode) return;
    const config: ComponentConfig = {
      platform,
      layoutType,
      layoutConfig,
      framing,
      style,
      theme,
      accent,
      typeface,
      animations,
      customPrompts,
    };
    generateComponent(config, { previousCode: generatedCode, instruction });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] p-0 bg-gradient-to-br from-neutral-950 via-neutral-950 to-neutral-900 border-neutral-800/90 shadow-[0_24px_80px_rgba(0,0,0,0.75)] overflow-hidden flex flex-col">
        <ErrorBoundary>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-800/90 bg-neutral-950/80 px-3 sm:px-4 py-2 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 items-center justify-center rounded-md bg-gradient-to-tr from-emerald-400 to-emerald-300 text-[0.65rem] font-semibold tracking-[0.16em] text-neutral-950">
                  PB
                </div>
                <div className="flex flex-col leading-tight">
                  <span className="text-xs font-semibold tracking-tight text-neutral-50">
                    Prompt Builder
                  </span>
                  <span className="text-[0.65rem] text-neutral-500">
                    Layout · Style · Motion
                  </span>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="hidden sm:flex items-center rounded-full border border-neutral-700 bg-neutral-900/80 p-[0.15rem] text-[0.7rem]">
                <button
                  onClick={() => setBuilderMode("prompt")}
                  className={cn(
                    "px-3 py-1 rounded-full transition-colors flex items-center gap-1.5",
                    builderMode === "prompt"
                      ? "bg-neutral-50 text-neutral-900 font-medium shadow-sm"
                      : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                  )}
                >
                  <FileText className="h-3 w-3" />
                  Prompt
                </button>
                <button
                  onClick={() => setBuilderMode("generate")}
                  className={cn(
                    "px-3 py-1 rounded-full transition-colors flex items-center gap-1.5",
                    builderMode === "generate"
                      ? "bg-emerald-500 text-neutral-950 font-medium shadow-sm"
                      : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                  )}
                >
                  <Sparkles className="h-3 w-3" />
                  Generate
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="h-7 px-2.5 rounded-full border border-neutral-800 bg-neutral-900/80 text-[0.7rem] text-neutral-300 hover:bg-neutral-800/80 hover:text-neutral-100"
              >
                <RotateCcw className="h-3 w-3 mr-1 opacity-80" />
                Reset
              </Button>

              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2.5 rounded-full border border-neutral-800 bg-neutral-900/80 text-[0.7rem] text-neutral-300 hover:bg-neutral-800/80 hover:text-neutral-100"
                >
                  <HelpCircle className="h-3.5 w-3.5 mr-1" />
                  Help
                </Button>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onOpenChange(false)}
                className="h-7 w-7 rounded-full border border-neutral-800 bg-neutral-900/80 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-100"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
            {/* LEFT PANE: Controls */}
            <div className="w-full md:w-[52%] border-r border-neutral-800/80 overflow-y-auto bg-gradient-to-b from-neutral-950 via-neutral-950/98 to-neutral-950/96">
              {/* Source controls */}
              <div className="border-b border-neutral-800/80 bg-neutral-950/90">
                <div className="flex flex-col gap-2 px-3 sm:px-4 pt-3 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.7rem] tracking-[0.18em] uppercase text-neutral-500">
                      Source
                    </span>
                    <div className="flex items-center gap-1.5 text-[0.7rem] text-neutral-500">
                      <Clock className="h-3 w-3" />
                      <span>Last change · Now</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[0.7rem] font-mono">
                    <button className="flex items-center justify-between gap-2 rounded-lg border border-neutral-800/90 bg-neutral-900/70 px-2.5 py-2 text-neutral-200 hover:border-neutral-700 hover:bg-neutral-900 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-neutral-400" />
                        <span>Template</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-neutral-500" />
                    </button>

                    <button className="flex items-center justify-between gap-2 rounded-lg border border-dashed border-neutral-800 bg-neutral-950/60 px-2.5 py-2 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-900/80 hover:text-neutral-100 transition-colors">
                      <div className="flex items-center gap-1.5">
                        <Code2 className="h-4 w-4 text-neutral-500" />
                        <span>HTML / JSX</span>
                      </div>
                      <ChevronDown className="h-4 w-4 text-neutral-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Layout section */}
              <div className="border-b border-neutral-800/80">
                <div className="px-3 sm:px-4 pt-3.5 pb-3 flex flex-col gap-3">
                  {/* Layout Type header */}
                  <div className="flex items-center gap-2">
                    <button className="inline-flex items-center gap-1 text-[0.68rem] tracking-[0.18em] uppercase text-neutral-500">
                      <ChevronDown className="h-3 w-3" />
                      <span>Layout Type</span>
                    </button>

                    <div className="ml-auto flex items-center rounded-full border border-neutral-800 bg-neutral-900/70 p-[0.15rem] text-[0.7rem]">
                      <button
                        onClick={() => setPlatform("web")}
                        className={cn(
                          "px-2.5 py-0.5 rounded-full transition-colors",
                          platform === "web"
                            ? "bg-neutral-50 text-neutral-900 font-medium shadow-sm"
                            : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                        )}
                      >
                        Web
                      </button>
                      <button
                        onClick={() => setPlatform("mobile")}
                        className={cn(
                          "px-2.5 py-0.5 rounded-full transition-colors",
                          platform === "mobile"
                            ? "bg-neutral-50 text-neutral-900 font-medium shadow-sm"
                            : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                        )}
                      >
                        Mobile
                      </button>
                    </div>
                  </div>

                  {/* Layout chips */}
                  <LayoutChips layoutType={layoutType} setLayoutType={setLayoutType} />

                  {/* Layout Configuration */}
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.68rem] tracking-[0.18em] uppercase text-neutral-500">
                        Layout Configuration
                      </span>
                      <span className="text-[0.68rem] text-neutral-500">
                        {layoutConfig ? layoutConfig : "None selected"}
                      </span>
                    </div>

                    <LayoutConfigChips layoutConfig={layoutConfig} setLayoutConfig={setLayoutConfig} />
                  </div>

                  {/* Framing */}
                  <div className="flex flex-col gap-2 mt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.68rem] tracking-[0.18em] uppercase text-neutral-500">
                        Framing
                      </span>
                      <span className="text-[0.68rem] text-neutral-500">
                        {framing ? framing : "None selected"}
                      </span>
                    </div>

                    <FramingChips framing={framing} setFraming={setFraming} />
                  </div>
                </div>
              </div>

              {/* Style & Theme */}
              <div className="border-b border-neutral-800/80">
                <div className="px-3 sm:px-4 pt-3.5 pb-3 flex flex-col gap-4">
                  {/* Style */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <button className="inline-flex items-center gap-1 text-[0.68rem] tracking-[0.18em] uppercase text-neutral-500">
                        <ChevronDown className="h-3 w-3" />
                        <span>Style</span>
                      </button>
                      <span className="text-[0.68rem] text-neutral-500">
                        {style} · Subtle
                      </span>
                    </div>

                    <StyleChips style={style} setStyle={setStyle} />
                  </div>

                  {/* Theme */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.68rem] tracking-[0.18em] uppercase text-neutral-500">
                        Theme
                      </span>
                      <div className="flex items-center gap-2 text-[0.68rem] text-neutral-500">
                        {theme === "dark" ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                        <span>{theme === "dark" ? "Dark" : "Light"}</span>
                      </div>
                    </div>

                    <ThemeChips theme={theme} setTheme={setTheme} />
                  </div>

                  {/* Accent Color */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[0.68rem] tracking-[0.18em] uppercase text-neutral-500">
                        Accent
                      </span>
                      <span className={cn(
                        "text-[0.68rem]",
                        accent === "emerald" && "text-emerald-300",
                        accent === "sky" && "text-sky-300",
                        accent === "indigo" && "text-indigo-300",
                        accent === "fuchsia" && "text-fuchsia-300"
                      )}>
                        {accent.charAt(0).toUpperCase() + accent.slice(1)}
                      </span>
                    </div>

                    <AccentChips accent={accent} setAccent={setAccent} />
                  </div>
                </div>
              </div>

              {/* Typography & Animation */}
              <div className="px-3 sm:px-4 pt-3.5 pb-6 flex flex-col gap-4">
                {/* Typeface Family */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <button className="inline-flex items-center gap-1 text-[0.68rem] tracking-[0.18em] uppercase text-neutral-500">
                      <ChevronDown className="h-3 w-3" />
                      <span>Typeface</span>
                    </button>
                    <span className="text-[0.68rem] text-neutral-400">
                      {typeface === "sans" ? "Inter · System" : typeface === "serif" ? "Serif" : "Monospace"}
                    </span>
                  </div>

                  <TypefaceChips typeface={typeface} setTypeface={setTypeface} />
                </div>

                {/* Animation Type */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <button className="inline-flex items-center gap-1 text-[0.68rem] tracking-[0.18em] uppercase text-neutral-500">
                      <ChevronDown className="h-3 w-3" />
                      <span>Animation</span>
                    </button>
                    <span className="text-[0.68rem] text-neutral-400">Multi-select</span>
                  </div>

                  <AnimationChips animations={animations} toggleAnimation={toggleAnimation} />
                </div>
              </div>
            </div>

            {/* RIGHT PANE: Preview + Generated Prompts OR Component Generation */}
            <div className="w-full md:w-[48%] flex flex-col bg-neutral-950/95">
              {builderMode === "generate" ? (
                /* GENERATE MODE */
                <>
                  {/* Preview/Code Toggle */}
                  <div className="flex items-center justify-between px-3 py-2 border-b border-neutral-800/80 bg-neutral-950/90">
                    <div className="flex items-center rounded-full border border-neutral-700 bg-neutral-900/80 p-[0.15rem] text-[0.7rem]">
                      <button
                        onClick={() => setPreviewMode("preview")}
                        className={cn(
                          "px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1",
                          previewMode === "preview"
                            ? "bg-neutral-50 text-neutral-900 font-medium shadow-sm"
                            : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                        )}
                      >
                        <Eye className="h-3 w-3" />
                        Preview
                      </button>
                      <button
                        onClick={() => setPreviewMode("code")}
                        className={cn(
                          "px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1",
                          previewMode === "code"
                            ? "bg-neutral-50 text-neutral-900 font-medium shadow-sm"
                            : "text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800"
                        )}
                      >
                        <FileCode className="h-3 w-3" />
                        Code
                      </button>
                    </div>

                    <Button
                      onClick={handleGenerateComponent}
                      disabled={isGenerating}
                      className="h-7 px-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-[0.7rem] font-semibold rounded-full shadow-lg shadow-emerald-500/20"
                    >
                      {isGenerating ? (
                        <>
                          <RotateCcw className="h-3 w-3 mr-1.5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3 mr-1.5" />
                          {generatedCode ? "Regenerate" : "Generate Component"}
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="flex-1 overflow-hidden relative">
                    {previewMode === "preview" ? (
                      <LivePreview 
                        code={generatedCode} 
                        isLoading={isGenerating} 
                        theme={theme}
                      />
                    ) : (
                      <CodePreview 
                        code={generatedCode} 
                        isLoading={isGenerating} 
                      />
                    )}
                  </div>

                  {/* AI Refinement Chat */}
                  <RefinementChat 
                    onRefine={handleRefine}
                    isLoading={isGenerating}
                    disabled={!generatedCode}
                    context={{ theme, layoutType }}
                  />
                </>
              ) : (
                /* PROMPT MODE */
                <>
                  {/* Generated Prompts List */}
                  <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Wand2 className="h-4 w-4 text-emerald-400" />
                        <span className="text-xs font-semibold tracking-wider uppercase text-neutral-400">
                          Generated Prompt
                        </span>
                      </div>
                      <button 
                        onClick={selectAllPrompts}
                        className="text-[0.65rem] text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                      >
                        Select All
                      </button>
                    </div>

                    {generatedPrompts.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => togglePromptSelection(p.id)}
                        className={cn(
                          "group text-left p-3 rounded-xl border transition-all relative overflow-hidden",
                          selectedPromptIds.includes(p.id)
                            ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_4px_20px_rgba(16,185,129,0.08)]"
                            : "border-neutral-800/80 bg-neutral-900/40 hover:border-neutral-700/80 hover:bg-neutral-900/60"
                        )}
                      >
                        <div className="flex flex-col gap-1.5 relative z-10">
                          <span className={cn(
                            "text-[0.6rem] font-bold tracking-widest uppercase",
                            selectedPromptIds.includes(p.id) ? "text-emerald-400" : "text-neutral-500"
                          )}>
                            {p.category}
                          </span>
                          <p className={cn(
                            "text-[0.75rem] leading-relaxed",
                            selectedPromptIds.includes(p.id) ? "text-neutral-100" : "text-neutral-400"
                          )}>
                            {p.text}
                          </p>
                        </div>
                        {selectedPromptIds.includes(p.id) && (
                          <div className="absolute top-2 right-2">
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                        )}
                      </button>
                    ))}

                    <div className="mt-3 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/70 p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <PlusCircle className="h-3.5 w-3.5 text-neutral-500" />
                        <span className="text-[0.65rem] font-bold tracking-wider uppercase text-neutral-500">
                          Add Custom Instruction
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addCustomPrompt()}
                          placeholder="e.g. Add a glassmorphism contact form..."
                          className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-1.5 text-[0.75rem] text-neutral-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                        />
                        <Button 
                          size="icon" 
                          onClick={addCustomPrompt}
                          className="h-8 w-8 bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Final Prompt Preview */}
                  <div className="mt-auto border-t border-neutral-800/90 bg-neutral-950/80 p-4 backdrop-blur-md">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[0.65rem] font-bold tracking-widest uppercase text-neutral-500">
                          Final Prompt Preview
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button 
                            onClick={() => navigator.clipboard.writeText(getSelectedPromptsText())}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 text-[0.6rem] hover:text-neutral-200 transition-colors"
                          >
                            <Copy className="h-3 w-3" />
                            Copy
                          </button>
                        </div>
                      </div>

                      <div className="min-h-[60px] max-h-[120px] overflow-y-auto p-3 rounded-xl bg-neutral-900/50 border border-neutral-800/80 text-[0.75rem] text-neutral-300 italic leading-relaxed">
                        {selectedPromptIds.length > 0 ? (
                          getSelectedPromptsText()
                        ) : (
                          <span className="text-neutral-600">Select options from the left to build your prompt...</span>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setBuilderMode("generate")}
                          className="flex-1 bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-neutral-100 h-10 font-medium"
                        >
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Try Generating
                        </Button>
                        <Button
                          onClick={handleAddToMainPrompt}
                          disabled={selectedPromptIds.length === 0}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 h-10 font-bold shadow-lg shadow-emerald-500/20"
                        >
                          <LayoutTemplate className="h-4 w-4 mr-2" />
                          Use Prompt
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
}

// Layout Type Chips Component
function LayoutChips({ layoutType, setLayoutType }: { layoutType: LayoutType; setLayoutType: (l: LayoutType) => void }) {
  const layouts: { type: LayoutType; label: string; icon: any }[] = [
    { type: "hero", label: "Hero Section", icon: LayoutTemplate },
    { type: "features", label: "Features Grid", icon: LayoutTemplate },
    { type: "onboarding", label: "Onboarding", icon: LayoutTemplate },
    { type: "docs", label: "Documentation", icon: LayoutTemplate },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {layouts.map((l) => (
        <button
          key={l.type}
          onClick={() => setLayoutType(l.type)}
          className={cn(
            "flex flex-col items-start gap-1 p-2.5 rounded-xl border transition-all",
            layoutType === l.type
              ? "border-emerald-500/40 bg-emerald-500/5 shadow-[0_4px_20px_rgba(16,185,129,0.05)]"
              : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
          )}
        >
          <div className={cn(
            "p-1.5 rounded-lg",
            layoutType === l.type ? "bg-emerald-500/10 text-emerald-400" : "bg-neutral-800 text-neutral-500"
          )}>
            <l.icon className="h-4 w-4" />
          </div>
          <span className={cn(
            "text-[0.7rem] font-medium mt-0.5",
            layoutType === l.type ? "text-emerald-100" : "text-neutral-400"
          )}>
            {l.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// Layout Config Chips Component
function LayoutConfigChips({ layoutConfig, setLayoutConfig }: { layoutConfig: LayoutConfig | null; setLayoutConfig: (l: LayoutConfig | null) => void }) {
  const configs: { type: LayoutConfig; label: string }[] = [
    { type: "card", label: "Card Layout" },
    { type: "list", label: "List Layout" },
    { type: "grid", label: "Grid Layout" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {configs.map((c) => (
        <button
          key={c.type}
          onClick={() => setLayoutConfig(layoutConfig === c.type ? null : c.type)}
          className={cn(
            "px-3 py-1.5 rounded-lg border text-[0.7rem] transition-all",
            layoutConfig === c.type
              ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-200 shadow-sm"
              : "border-neutral-800 bg-neutral-900/70 text-neutral-400 hover:border-neutral-700"
          )}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

// Framing Chips Component
function FramingChips({ framing, setFraming }: { framing: FramingType | null; setFraming: (f: FramingType | null) => void }) {
  const frames: { type: FramingType; label: string }[] = [
    { type: "fullscreen", label: "Full Screen" },
    { type: "card", label: "Card Frame" },
    { type: "browser", label: "Browser Mock" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {frames.map((f) => (
        <button
          key={f.type}
          onClick={() => setFraming(framing === f.type ? null : f.type)}
          className={cn(
            "px-3 py-1.5 rounded-lg border text-[0.7rem] transition-all",
            framing === f.type
              ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-200 shadow-sm"
              : "border-neutral-800 bg-neutral-900/70 text-neutral-400 hover:border-neutral-700"
          )}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

// Style Chips Component
function StyleChips({ style, setStyle }: { style: StyleType; setStyle: (s: StyleType) => void }) {
  const styles: { type: StyleType; label: string }[] = [
    { type: "flat", label: "Flat" },
    { type: "outline", label: "Outline" },
    { type: "glass", label: "Glass" },
  ];

  return (
    <div className="grid grid-cols-3 gap-2">
      {styles.map((s) => (
        <button
          key={s.type}
          onClick={() => setStyle(s.type)}
          className={cn(
            "flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all",
            style === s.type
              ? "border-emerald-500/40 bg-emerald-500/5 shadow-sm"
              : "border-neutral-800 bg-neutral-900/70 hover:border-neutral-700"
          )}
        >
          <div className={cn(
            "h-8 w-12 rounded-lg border-2",
            s.type === "flat" && "bg-emerald-500/20 border-emerald-500/40",
            s.type === "outline" && "border-emerald-500/40 border-dashed",
            s.type === "glass" && "bg-white/10 backdrop-blur-sm border-white/20"
          )} />
          <span className={cn(
            "text-[0.65rem] font-medium",
            style === s.type ? "text-emerald-200" : "text-neutral-400"
          )}>
            {s.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// Theme Chips Component
function ThemeChips({ theme, setTheme }: { theme: ThemeType; setTheme: (t: ThemeType) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "flex items-center gap-3 p-2.5 rounded-xl border transition-all",
          theme === "dark"
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-neutral-800 bg-neutral-900/70 hover:border-neutral-700"
        )}
      >
        <div className="h-4 w-4 rounded-full bg-neutral-950 border border-neutral-700 shadow-inner" />
        <span className={cn(
          "text-[0.7rem] font-medium",
          theme === "dark" ? "text-emerald-100" : "text-neutral-400"
        )}>
          Dark Mode
        </span>
      </button>
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "flex items-center gap-3 p-2.5 rounded-xl border transition-all",
          theme === "light"
            ? "border-emerald-500/40 bg-emerald-500/5"
            : "border-neutral-800 bg-neutral-900/70 hover:border-neutral-700"
        )}
      >
        <div className="h-4 w-4 rounded-full bg-neutral-100 border border-neutral-300" />
        <span className={cn(
          "text-[0.7rem] font-medium",
          theme === "light" ? "text-emerald-100" : "text-neutral-400"
        )}>
          Light Mode
        </span>
      </button>
    </div>
  );
}

// Accent Color Chips Component
function AccentChips({ accent, setAccent }: { accent: AccentColor; setAccent: (a: AccentColor) => void }) {
  const colors: { type: AccentColor; color: string }[] = [
    { type: "emerald", color: "bg-emerald-500" },
    { type: "sky", color: "bg-sky-500" },
    { type: "indigo", color: "bg-indigo-500" },
    { type: "fuchsia", color: "bg-fuchsia-500" },
  ];

  return (
    <div className="flex justify-between items-center px-1">
      {colors.map((c) => (
        <button
          key={c.type}
          onClick={() => setAccent(c.type)}
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center transition-all p-0.5",
            accent === c.type ? "ring-2 ring-emerald-500/50 ring-offset-2 ring-offset-neutral-950" : "hover:scale-110"
          )}
        >
          <div className={cn("h-full w-full rounded-full shadow-lg", c.color)} />
        </button>
      ))}
    </div>
  );
}

// Typeface Chips Component
function TypefaceChips({ typeface, setTypeface }: { typeface: TypefaceType; setTypeface: (t: TypefaceType) => void }) {
  const types: { type: TypefaceType; label: string; preview: string }[] = [
    { type: "sans", label: "Sans Serif", preview: "Aa" },
    { type: "serif", label: "Serif", preview: "Aa" },
    { type: "mono", label: "Monospace", preview: "Aa" },
  ];

  return (
    <div className="overflow-x-auto pb-1.5">
      <div className="flex gap-2.5 min-w-max">
        {types.map((t) => (
          <button
            key={t.type}
            onClick={() => setTypeface(t.type)}
            className={cn(
              "flex w-20 flex-col items-center rounded-lg px-1.5 pb-1.5 pt-1 transition-colors",
              typeface === t.type
                ? "border border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                : "border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-900"
            )}
          >
            <div className={cn(
              "mt-0.5 flex h-9 w-[3.5rem] items-center justify-center text-lg",
              t.type === "sans" && "font-sans",
              t.type === "serif" && "font-serif",
              t.type === "mono" && "font-mono"
            )}>
              {t.preview}
            </div>
            <span className={cn(
              "text-[0.65rem]",
              typeface === t.type ? "text-emerald-200" : "text-neutral-200"
            )}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Animation Chips
function AnimationChips({ animations, toggleAnimation }: { animations: AnimationType[]; toggleAnimation: (a: AnimationType) => void }) {
  const animationTypes: { type: AnimationType; label: string }[] = [
    { type: "fade", label: "Fade" },
    { type: "slide", label: "Slide" },
    { type: "scale", label: "Scale" },
  ];

  return (
    <div className="overflow-x-auto pb-1.5">
      <div className="flex gap-2.5 min-w-max text-[0.7rem]">
        {animationTypes.map((a) => (
          <button
            key={a.type}
            onClick={() => toggleAnimation(a.type)}
            className={cn(
              "flex w-20 flex-col items-center rounded-lg px-1.5 pb-1.5 pt-1.5 transition-colors",
              animations.includes(a.type)
                ? "border border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                : "border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-900"
            )}
          >
            <div className="mt-0.5 mb-1 flex h-9 w-[3.5rem] items-center justify-center">
              <div className={cn(
                "h-4 w-6 rounded-md bg-neutral-500/80",
                a.type === "fade" && "animate-pulse",
                a.type === "slide" && "animate-bounce",
                a.type === "scale" && "animate-ping"
              )}></div>
            </div>
            <span className={cn(
              "text-[0.65rem]",
              animations.includes(a.type) ? "text-emerald-200" : "text-neutral-200"
            )}>
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
