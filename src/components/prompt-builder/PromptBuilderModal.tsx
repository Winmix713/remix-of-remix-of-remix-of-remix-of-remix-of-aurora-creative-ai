import { useState, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, RotateCcw, HelpCircle, Sparkles, Clock, ChevronDown, FileText, Code2, Moon, Sun, Plus, Copy, Wand2, PlayCircle, LayoutTemplate, PlusCircle, Check, Eye, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { CodePreview } from "./CodePreview";
import { LivePreview } from "./LivePreview";
import { RefinementChat } from "./RefinementChat";
import { useGenerateComponent, type ComponentConfig } from "@/hooks/useGenerateComponent";

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
                    className="h-8 px-4 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-neutral-950 font-medium text-[0.75rem] rounded-full shadow-lg shadow-emerald-500/20"
                  >
                    {isGenerating ? (
                      <>
                        <span className="h-3 w-3 mr-1.5 rounded-full border-2 border-neutral-950/30 border-t-neutral-950 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        Generate Component
                      </>
                    )}
                  </Button>
                </div>

                {/* Preview/Code Area */}
                <div className="flex-1 overflow-hidden">
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

                {/* Refinement Chat */}
                <RefinementChat
                  onRefine={handleRefine}
                  isLoading={isGenerating}
                  disabled={!generatedCode}
                />
              </>
            ) : (
              /* PROMPT MODE */
              <>
                {/* Preview Area */}
                <div className="hidden md:block h-[26.5rem] border-b border-neutral-800/80 bg-gradient-to-b from-neutral-950 to-neutral-900/95">
                  <div className="h-full overflow-auto px-4 py-4">
                    {/* Section: Layout preview */}
                    <div className="relative mb-4">
                      <div className="absolute -top-2 left-0 inline-flex items-center gap-1 rounded-full border border-neutral-700 bg-neutral-950/90 px-2.5 py-0.5 text-[0.65rem] tracking-[0.18em] uppercase text-neutral-300">
                        <LayoutTemplate className="h-3 w-3" />
                        <span>Layout</span>
                        <span className="text-neutral-500">· {layoutType} · {platform}</span>
                      </div>
                      <div className="mt-3 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/70 p-3">
                        <div className="h-52 rounded-xl border border-neutral-800 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center text-[0.75rem] text-neutral-500">
                          Layout preview coming from your selection
                        </div>
                      </div>
                    </div>

                    {/* Section: Style / Typography preview */}
                    <div className="relative mt-5 mb-3">
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-neutral-600 to-transparent"></div>
                      <span className="absolute left-1/2 -top-2 -translate-x-1/2 rounded-full border border-neutral-800 bg-neutral-950 px-2.5 text-[0.68rem] tracking-[0.18em] uppercase text-neutral-400">
                        Typography & Style
                      </span>
                    </div>

                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/95 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[0.68rem] font-medium text-emerald-200">
                          <Sparkles className="h-3 w-3" />
                          <span>System-optimized prompt</span>
                        </div>
                        <span className="text-[0.68rem] text-neutral-500">
                          Generated once you pick a layout
                        </span>
                      </div>

                      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-50 mb-1.5">
                        Design your UI prompt like a real interface
                      </h1>

                      <h2 className="text-base md:text-lg font-medium text-neutral-300 mb-2.5">
                        Combine layout, visual style and motion into a single, precise instruction for your model.
                      </h2>

                      <p className="text-sm md:text-[0.95rem] text-neutral-400 mb-3 leading-relaxed">
                        Use the controls on the left to configure structure, framing, theme, typography and animations. This
                        panel shows how the system will interpret your selections before turning them into a prompt.
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <Button
                          onClick={handleAddToMainPrompt}
                          className="inline-flex items-center gap-1.5 rounded-full bg-neutral-50 px-3.5 py-1.5 text-[0.8rem] font-medium text-neutral-900 hover:bg-neutral-200 transition-colors"
                        >
                          <Wand2 className="h-4 w-4" />
                          Generate prompt text
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => navigator.clipboard.writeText(getSelectedPromptsText())}
                          className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-neutral-600 px-3 py-1.5 text-[0.8rem] font-medium text-neutral-300 hover:border-neutral-400 hover:text-neutral-100 transition-colors"
                        >
                          <Copy className="h-4 w-4" />
                          Copy as instruction
                        </Button>
                      </div>
                    </div>

                    {/* Section: Animation preview */}
                    <div className="relative mt-5 mb-3">
                      <div className="h-[1px] bg-gradient-to-r from-transparent via-neutral-600 to-transparent"></div>
                      <span className="absolute left-1/2 -top-2 -translate-x-1/2 rounded-full border border-neutral-800 bg-neutral-950 px-2.5 text-[0.68rem] tracking-[0.18em] uppercase text-neutral-400">
                        Animation Preview
                      </span>
                    </div>

                    <div className="relative rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/70 p-3">
                      <div className="absolute -top-2 left-0 inline-flex items-center gap-1 rounded-full border border-neutral-800 bg-neutral-950 px-2.5 py-0.5 text-[0.65rem] tracking-[0.18em] uppercase text-neutral-300">
                        <PlayCircle className="h-3 w-3" />
                        <span>Animation</span>
                        <span className="text-neutral-500">· {animations.length > 0 ? animations.join(", ") : "None"}</span>
                      </div>
                      <div className="mt-3 flex h-44 items-center justify-center text-[0.75rem] text-neutral-500">
                        {animations.length > 0 ? (
                          <div className="flex gap-4">
                            {animations.includes("fade") && (
                              <div className="h-8 w-12 rounded-md bg-neutral-500/80 animate-pulse"></div>
                            )}
                            {animations.includes("slide") && (
                              <div className="h-8 w-12 rounded-md bg-neutral-500/80 animate-bounce"></div>
                            )}
                            {animations.includes("scale") && (
                              <div className="h-8 w-12 rounded-md bg-neutral-500/80 animate-ping"></div>
                            )}
                          </div>
                        ) : (
                          "Choose animation types to see a motion preview here."
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Generated Prompts */}
                <div className="flex-1 overflow-y-auto bg-neutral-950/98 px-3.5 sm:px-4 py-3">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p className="text-[0.68rem] tracking-[0.18em] uppercase text-neutral-500">
                        Generated Prompts
                      </p>
                      <span className="text-[0.68rem] text-emerald-400">
                        {selectedPromptIds.length}/{generatedPrompts.length} selected
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={selectAllPrompts}
                        className="h-7 px-2 text-[0.68rem] text-neutral-400 hover:text-neutral-200"
                      >
                        Select all
                      </Button>
                      <Button
                        onClick={handleAddToMainPrompt}
                        disabled={selectedPromptIds.length === 0}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 px-3 py-1.5 text-[0.75rem] font-medium text-neutral-950 shadow-[0_0_0_1px_rgba(22,163,74,0.35)] hover:bg-emerald-400 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                        Add to main prompt
                      </Button>
                    </div>
                  </div>

                  {/* Custom prompt entry */}
                  <div className="mb-3">
                    <div className="group rounded-lg border border-neutral-800 bg-neutral-950/80 p-2 text-[0.75rem] font-mono text-neutral-300 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-neutral-600 hover:bg-neutral-900/80 transition-colors">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-1">
                          <div className="h-3 w-3 rounded-full border border-neutral-600 bg-neutral-950 flex-shrink-0"></div>
                          <input
                            type="text"
                            placeholder="Add custom instruction…"
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") addCustomPrompt();
                            }}
                            className="bg-transparent border-none outline-none flex-1 text-neutral-300 placeholder:text-neutral-400"
                          />
                        </div>
                        <button
                          onClick={addCustomPrompt}
                          className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-emerald-400 hover:text-emerald-300"
                        >
                          <PlusCircle className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Prompt list based on selections */}
                  <div className="space-y-2 text-[0.75rem] font-mono">
                    {generatedPrompts.map((prompt) => {
                      const isSelected = selectedPromptIds.includes(prompt.id);
                      return (
                        <div
                          key={prompt.id}
                          className={cn(
                            "rounded-lg border bg-neutral-950/80 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] hover:border-neutral-600 hover:bg-neutral-900/80 transition-colors cursor-pointer",
                            isSelected
                              ? "border-emerald-500/40 bg-emerald-500/5"
                              : "border-neutral-800"
                          )}
                          onClick={() => togglePromptSelection(prompt.id)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-1.5 flex-1">
                              <div className={cn(
                                "h-4 w-4 rounded-full border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors",
                                isSelected
                                  ? "border-emerald-500 bg-emerald-500"
                                  : "border-neutral-600 bg-neutral-950"
                              )}>
                                {isSelected && <Check className="h-2.5 w-2.5 text-neutral-950" />}
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[0.6rem] uppercase tracking-wider text-emerald-400/80">
                                  {prompt.category}
                                </span>
                                <span className={cn(
                                  "text-neutral-300 leading-relaxed",
                                  isSelected && "text-neutral-200"
                                )}>
                                  {prompt.text}
                                </span>
                              </div>
                            </div>
                            <button 
                              className={cn(
                                "inline-flex items-center gap-1 text-[0.72rem] font-semibold transition-colors flex-shrink-0",
                                isSelected 
                                  ? "text-emerald-300" 
                                  : "text-emerald-400 hover:text-emerald-300"
                              )}
                            >
                              {isSelected ? (
                                <>
                                  <Check className="h-4 w-4" />
                                  Added
                                </>
                              ) : (
                                <>
                                  <Plus className="h-4 w-4" />
                                  Add
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Layout Type Chips Component
function LayoutChips({ layoutType, setLayoutType }: { layoutType: LayoutType; setLayoutType: (t: LayoutType) => void }) {
  const layouts: { type: LayoutType; label: string }[] = [
    { type: "hero", label: "Hero" },
    { type: "features", label: "Features" },
    { type: "onboarding", label: "Onboarding" },
    { type: "docs", label: "Docs" },
  ];

  return (
    <div className="overflow-x-auto pb-1.5">
      <div className="flex gap-2.5 min-w-max text-[0.7rem]">
        {layouts.map((layout) => (
          <button
            key={layout.type}
            onClick={() => setLayoutType(layout.type)}
            className={cn(
              "relative flex w-20 flex-col items-center rounded-lg px-1.5 pb-1.5 pt-1.5 transition-colors",
              layoutType === layout.type
                ? "border border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                : "border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-900"
            )}
          >
            <div className="relative mt-0.5 mb-1 w-[3.5rem] h-10">
              <LayoutPreview type={layout.type} />
            </div>
            <span className={cn(
              "text-[0.65rem]",
              layoutType === layout.type ? "text-emerald-200" : "text-neutral-200"
            )}>
              {layout.label}
            </span>
            {layoutType === layout.type && (
              <span className="absolute -top-1.5 right-1 rounded-full bg-emerald-500 text-[0.55rem] font-medium px-1.5 py-[0.03rem] text-neutral-950 shadow-sm">
                Active
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// Layout Preview Mini Component
function LayoutPreview({ type }: { type: LayoutType }) {
  switch (type) {
    case "hero":
      return (
        <div className="w-full h-full rounded-md bg-neutral-900/90 border border-neutral-700/80 shadow-sm">
          <div className="h-[34%] rounded-t-md bg-neutral-800/90"></div>
          <div className="h-[66%] flex flex-col gap-[0.12rem] p-[0.18rem]">
            <div className="h-[42%] rounded-sm bg-neutral-700/80"></div>
            <div className="flex gap-[0.12rem] h-[34%]">
              <div className="flex-1 rounded-sm bg-neutral-700/70"></div>
              <div className="flex-1 rounded-sm bg-neutral-800/80"></div>
            </div>
            <div className="h-[18%] rounded-sm bg-neutral-800/70"></div>
          </div>
        </div>
      );
    case "features":
      return (
        <div className="w-full h-full rounded-md bg-neutral-900/90 border border-neutral-700/80">
          <div className="h-[26%] rounded-t-md bg-neutral-800/90"></div>
          <div className="h-[74%] flex gap-[0.12rem] p-[0.18rem]">
            <div className="flex-1 rounded-sm bg-neutral-700/80"></div>
            <div className="flex-1 rounded-sm bg-neutral-800/80"></div>
            <div className="flex-1 rounded-sm bg-neutral-700/80"></div>
          </div>
        </div>
      );
    case "onboarding":
      return (
        <div className="w-full h-full rounded-md bg-neutral-900/90 border border-neutral-700/80">
          <div className="flex h-full gap-[0.12rem] p-[0.18rem]">
            <div className="flex-1 flex flex-col gap-[0.12rem]">
              <div className="h-[22%] rounded-sm bg-neutral-800/90"></div>
              <div className="flex-1 rounded-sm bg-neutral-700/70"></div>
            </div>
            <div className="w-[42%] flex flex-col gap-[0.12rem]">
              <div className="h-[38%] rounded-sm bg-neutral-700/90"></div>
              <div className="h-[28%] rounded-sm bg-neutral-800/70"></div>
              <div className="h-[28%] rounded-sm bg-neutral-800/80"></div>
            </div>
          </div>
        </div>
      );
    case "docs":
      return (
        <div className="w-full h-full rounded-md bg-neutral-900/90 border border-neutral-700/80 flex gap-[0.12rem] p-[0.18rem]">
          <div className="w-[30%] flex flex-col gap-[0.08rem]">
            <div className="h-3 rounded-sm bg-neutral-800/90"></div>
            <div className="h-2 rounded-sm bg-neutral-800/70"></div>
            <div className="h-2 rounded-sm bg-neutral-700/80"></div>
            <div className="h-2 rounded-sm bg-neutral-800/60"></div>
          </div>
          <div className="flex-1 flex flex-col gap-[0.12rem]">
            <div className="h-[42%] rounded-sm bg-neutral-800/80"></div>
            <div className="flex-1 rounded-sm bg-neutral-700/70"></div>
          </div>
        </div>
      );
    default:
      return null;
  }
}

// Layout Config Chips
function LayoutConfigChips({ layoutConfig, setLayoutConfig }: { layoutConfig: LayoutConfig | null; setLayoutConfig: (c: LayoutConfig | null) => void }) {
  const configs: { type: LayoutConfig; label: string }[] = [
    { type: "card", label: "Card" },
    { type: "list", label: "List" },
    { type: "grid", label: "Grid" },
  ];

  return (
    <div className="overflow-x-auto pb-1.5">
      <div className="flex gap-2.5 min-w-max text-[0.7rem]">
        {configs.map((config) => (
          <button
            key={config.type}
            onClick={() => setLayoutConfig(layoutConfig === config.type ? null : config.type)}
            className={cn(
              "flex w-20 flex-col items-center rounded-lg px-1.5 pb-1.5 pt-1.5 transition-colors",
              layoutConfig === config.type
                ? "border border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                : "border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-900"
            )}
          >
            <div className="mt-0.5 mb-1 flex h-9 w-[3.5rem] items-center justify-center">
              <LayoutConfigPreview type={config.type} />
            </div>
            <span className={cn(
              "text-[0.65rem]",
              layoutConfig === config.type ? "text-emerald-200" : "text-neutral-200"
            )}>
              {config.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LayoutConfigPreview({ type }: { type: LayoutConfig }) {
  switch (type) {
    case "card":
      return (
        <div className="flex h-[2.25rem] w-[2.25rem] items-center justify-center">
          <div className="h-[1.75rem] w-[2rem] rounded-md bg-neutral-800/90 border border-neutral-700 shadow-sm"></div>
        </div>
      );
    case "list":
      return (
        <div className="flex h-[2.25rem] w-[2.25rem] flex-col justify-center gap-[0.12rem]">
          <div className="h-[0.4rem] w-full rounded-sm bg-neutral-800/90"></div>
          <div className="h-[0.4rem] w-[85%] rounded-sm bg-neutral-800/70"></div>
          <div className="h-[0.4rem] w-full rounded-sm bg-neutral-800/90"></div>
          <div className="h-[0.4rem] w-[70%] rounded-sm bg-neutral-800/70"></div>
        </div>
      );
    case "grid":
      return (
        <div className="grid h-[2.25rem] w-[2.25rem] grid-cols-2 gap-[0.08rem]">
          <div className="rounded-sm bg-neutral-800/90"></div>
          <div className="rounded-sm bg-neutral-800/90"></div>
          <div className="rounded-sm bg-neutral-800/90"></div>
          <div className="rounded-sm bg-neutral-800/90"></div>
        </div>
      );
    default:
      return null;
  }
}

// Framing Chips
function FramingChips({ framing, setFraming }: { framing: FramingType | null; setFraming: (f: FramingType | null) => void }) {
  const framings: { type: FramingType; label: string }[] = [
    { type: "fullscreen", label: "Full Screen" },
    { type: "card", label: "Card" },
    { type: "browser", label: "Browser" },
  ];

  return (
    <div className="overflow-x-auto pb-1.5">
      <div className="flex gap-2.5 min-w-max text-[0.7rem]">
        {framings.map((f) => (
          <button
            key={f.type}
            onClick={() => setFraming(framing === f.type ? null : f.type)}
            className={cn(
              "flex w-20 flex-col items-center rounded-lg px-1.5 pb-1.5 pt-1.5 transition-colors",
              framing === f.type
                ? "border border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                : "border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-900"
            )}
          >
            <div className="mt-0.5 mb-1 flex h-9 w-[3.5rem] items-center justify-center">
              <FramingPreview type={f.type} />
            </div>
            <span className={cn(
              "text-[0.65rem]",
              framing === f.type ? "text-emerald-200" : "text-neutral-200"
            )}>
              {f.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function FramingPreview({ type }: { type: FramingType }) {
  switch (type) {
    case "fullscreen":
      return <div className="h-[2.4rem] w-[3.1rem] rounded-sm bg-neutral-800/90 border border-neutral-700"></div>;
    case "card":
      return (
        <div className="flex h-[2.4rem] w-[3.1rem] items-center justify-center rounded-sm bg-neutral-900 border border-neutral-700">
          <div className="h-[1.65rem] w-[2.4rem] rounded-lg bg-neutral-800/95 border border-neutral-600"></div>
        </div>
      );
    case "browser":
      return (
        <div className="h-[2.4rem] w-[3.1rem] rounded-md bg-neutral-850 border border-neutral-700 flex flex-col">
          <div className="h-[22%] flex items-center gap-[0.12rem] px-[0.22rem]">
            <div className="h-[0.55rem] w-[0.9rem] rounded-sm bg-neutral-700/90"></div>
            <div className="h-[0.4rem] flex-1 rounded-sm bg-neutral-800/90"></div>
          </div>
          <div className="flex-1 bg-neutral-900/90 rounded-b-md border-t border-neutral-800"></div>
        </div>
      );
    default:
      return null;
  }
}

// Style Chips
function StyleChips({ style, setStyle }: { style: StyleType; setStyle: (s: StyleType) => void }) {
  const styles: { type: StyleType; label: string }[] = [
    { type: "flat", label: "Flat" },
    { type: "outline", label: "Outline" },
    { type: "glass", label: "Glass" },
  ];

  return (
    <div className="overflow-x-auto pb-1.5">
      <div className="flex gap-2.5 min-w-max text-[0.7rem]">
        {styles.map((s) => (
          <button
            key={s.type}
            onClick={() => setStyle(s.type)}
            className={cn(
              "flex w-20 flex-col items-center rounded-lg px-1.5 pb-1.5 pt-1.5 transition-colors",
              style === s.type
                ? "border border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                : "border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-900"
            )}
          >
            <div className="mt-0.5 mb-1 flex h-9 w-[3.5rem] items-center justify-center">
              <StylePreview type={s.type} />
            </div>
            <span className={cn(
              "text-[0.65rem]",
              style === s.type ? "text-emerald-200" : "text-neutral-200"
            )}>
              {s.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function StylePreview({ type }: { type: StyleType }) {
  switch (type) {
    case "flat":
      return (
        <div className="flex h-9 w-[3.5rem] flex-col gap-[0.14rem]">
          <div className="h-[32%] rounded-md bg-neutral-800/90"></div>
          <div className="h-[22%] rounded-md bg-neutral-800/70"></div>
          <div className="h-[22%] rounded-md bg-neutral-800/60"></div>
        </div>
      );
    case "outline":
      return <div className="h-[2.2rem] w-[3rem] rounded-md border border-dashed border-neutral-600 bg-neutral-900/60"></div>;
    case "glass":
      return <div className="h-[2.2rem] w-[3rem] rounded-2xl border border-neutral-600/70 bg-gradient-to-br from-neutral-900 via-neutral-950 to-neutral-900 shadow-[0_18px_50px_rgba(0,0,0,0.8)]"></div>;
    default:
      return null;
  }
}

// Theme Chips
function ThemeChips({ theme, setTheme }: { theme: ThemeType; setTheme: (t: ThemeType) => void }) {
  return (
    <div className="overflow-x-auto pb-1.5">
      <div className="flex gap-2.5 min-w-max text-[0.7rem]">
        <button
          onClick={() => setTheme("light")}
          className={cn(
            "flex w-20 flex-col items-center rounded-lg px-1.5 pb-1.5 pt-1.5 transition-colors",
            theme === "light"
              ? "border border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
              : "border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-900"
          )}
        >
          <div className="mt-0.5 mb-1 flex h-9 w-[3.5rem] items-center justify-center">
            <div className="relative h-[2.2rem] w-[3rem] rounded-md bg-white border border-neutral-200 flex items-center justify-center">
              <Sun className="h-4 w-4 text-amber-400" />
            </div>
          </div>
          <span className={cn("text-[0.65rem]", theme === "light" ? "text-emerald-200" : "text-neutral-200")}>
            Light
          </span>
        </button>

        <button
          onClick={() => setTheme("dark")}
          className={cn(
            "flex w-20 flex-col items-center rounded-lg px-1.5 pb-1.5 pt-1.5 transition-colors",
            theme === "dark"
              ? "border border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
              : "border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-900"
          )}
        >
          <div className="mt-0.5 mb-1 flex h-9 w-[3.5rem] items-center justify-center">
            <div className="relative h-[2.2rem] w-[3rem] rounded-md bg-neutral-900 border border-neutral-700 flex items-center justify-center">
              <Moon className="h-4 w-4 text-neutral-50" />
            </div>
          </div>
          <span className={cn("text-[0.65rem]", theme === "dark" ? "text-emerald-200" : "text-neutral-200")}>
            Dark
          </span>
        </button>
      </div>
    </div>
  );
}

// Accent Chips
function AccentChips({ accent, setAccent }: { accent: AccentColor; setAccent: (a: AccentColor) => void }) {
  const accents: { type: AccentColor; label: string; color: string }[] = [
    { type: "emerald", label: "Em", color: "bg-emerald-400" },
    { type: "sky", label: "Sky", color: "bg-sky-400" },
    { type: "indigo", label: "In", color: "bg-indigo-400" },
    { type: "fuchsia", label: "Fu", color: "bg-fuchsia-400" },
  ];

  return (
    <div className="overflow-x-auto pb-1.5">
      <div className="flex gap-2.5 min-w-max text-[0.7rem]">
        {accents.map((a) => (
          <button
            key={a.type}
            onClick={() => setAccent(a.type)}
            className={cn(
              "flex w-16 flex-col items-center gap-1 rounded-lg px-1.5 py-1.5 transition-colors",
              accent === a.type
                ? "border border-emerald-500/60 bg-neutral-900/90 shadow-[0_0_0_1px_rgba(16,185,129,0.22)]"
                : "border border-neutral-800 bg-neutral-900/80 hover:border-neutral-700 hover:bg-neutral-900"
            )}
          >
            <span className={cn(
              "flex h-4 w-4 items-center justify-center rounded-full",
              a.color,
              accent === a.type && "shadow-[0_0_18px_rgba(16,185,129,0.8)]"
            )}></span>
            <span className={cn(
              "text-[0.65rem]",
              accent === a.type ? "text-emerald-200" : "text-neutral-200"
            )}>
              {a.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Typeface Chips
function TypefaceChips({ typeface, setTypeface }: { typeface: TypefaceType; setTypeface: (t: TypefaceType) => void }) {
  const typefaces: { type: TypefaceType; label: string }[] = [
    { type: "sans", label: "Sans" },
    { type: "serif", label: "Serif" },
    { type: "mono", label: "Mono" },
  ];

  return (
    <div className="overflow-x-auto pb-1.5">
      <div className="flex gap-2.5 min-w-max text-[0.7rem]">
        {typefaces.map((t) => (
          <button
            key={t.type}
            onClick={() => setTypeface(t.type)}
            className={cn(
              "flex w-20 flex-col items-center rounded-lg px-1.5 pb-1.5 pt-1.5 transition-colors",
              typeface === t.type
                ? "border border-emerald-500/40 bg-emerald-500/5 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]"
                : "border border-neutral-800 bg-neutral-900/70 hover:border-neutral-700 hover:bg-neutral-900"
            )}
          >
            <div className="mt-0.5 mb-1 flex h-9 w-[3.5rem] items-center justify-center">
              <span className={cn(
                "text-[0.9rem] tracking-tight",
                t.type === "sans" && "font-semibold font-sans",
                t.type === "serif" && "italic font-serif",
                t.type === "mono" && "font-mono text-[0.8rem]"
              )}>
                Aa
              </span>
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
