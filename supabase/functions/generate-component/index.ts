import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ComponentConfig {
  platform: string;
  layoutType: string;
  layoutConfig: string | null;
  framing: string | null;
  style: string;
  theme: string;
  accent: string;
  typeface: string;
  animations: string[];
  customPrompts: string[];
}

const ACCENT_COLORS: Record<string, { primary: string; gradient: string }> = {
  emerald: { primary: "emerald-500", gradient: "from-emerald-400 to-emerald-600" },
  sky: { primary: "sky-500", gradient: "from-sky-400 to-sky-600" },
  indigo: { primary: "indigo-500", gradient: "from-indigo-400 to-indigo-600" },
  fuchsia: { primary: "fuchsia-500", gradient: "from-fuchsia-400 to-fuchsia-600" },
};

const TYPEFACE_CLASSES: Record<string, string> = {
  sans: "font-sans",
  serif: "font-serif",
  mono: "font-mono",
};

function buildSystemPrompt(config: ComponentConfig): string {
  const accent = ACCENT_COLORS[config.accent] || ACCENT_COLORS.emerald;
  const typeface = TYPEFACE_CLASSES[config.typeface] || TYPEFACE_CLASSES.sans;
  
  return `You are an expert React/Tailwind CSS component generator. Generate clean, production-ready React functional components with Tailwind CSS.

## STRICT RULES:
1. Output ONLY the React component code - no explanations, no markdown code blocks
2. Use TypeScript with proper types
3. Use Tailwind CSS classes exclusively - no inline styles
4. Make components self-contained and immediately usable
5. Use semantic HTML elements
6. Include appropriate accessibility attributes (aria-labels, roles)
7. Export the component as default

## DESIGN SPECIFICATIONS:
- Platform: ${config.platform}
- Layout Type: ${config.layoutType}
- Layout Configuration: ${config.layoutConfig || "default"}
- Framing: ${config.framing || "none"}
- Style: ${config.style}
- Theme: ${config.theme}
- Primary Accent: ${accent.primary} (gradient: ${accent.gradient})
- Typography: ${typeface}
- Animations: ${config.animations.length > 0 ? config.animations.join(", ") : "none"}

## STYLE INTERPRETATIONS:
- "flat": Use solid colors, clean edges, minimal shadows
- "outline": Use border strokes, transparent backgrounds, subtle hover states
- "glass": Use backdrop-blur, bg-opacity, subtle borders, gradient overlays

## THEME INTERPRETATIONS:
- "dark": Use dark backgrounds (bg-neutral-900/950), light text (text-white/neutral-100)
- "light": Use light backgrounds (bg-white/neutral-50), dark text (text-neutral-900)

## ANIMATION CLASSES TO USE:
- "fade": Use transition-opacity, animate-fade-in
- "slide": Use transform translate, animate-slide-up
- "scale": Use transform scale, animate-scale-in

## FRAMING INTERPRETATIONS:
- "fullscreen": Component fills viewport (min-h-screen, w-full)
- "card": Component wrapped in rounded card container with shadow
- "browser": Component wrapped in browser mockup frame

Generate a beautiful, functional ${config.layoutType} component following all specifications.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { config, refinement } = await req.json() as { 
      config: ComponentConfig; 
      refinement?: { previousCode: string; instruction: string } 
    };
    
    console.log("Received generate-component request:", JSON.stringify(config, null, 2));
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildSystemPrompt(config);
    
    let userPrompt: string;
    
    if (refinement) {
      userPrompt = `Here is the current component code:

\`\`\`tsx
${refinement.previousCode}
\`\`\`

Please modify the component according to this instruction: "${refinement.instruction}"

Output only the modified component code, no explanations.`;
    } else {
      const customInstructions = config.customPrompts.length > 0 
        ? `\n\nAdditional requirements:\n${config.customPrompts.map((p, i) => `${i + 1}. ${p}`).join("\n")}`
        : "";
        
      userPrompt = `Generate a ${config.layoutType} component for a ${config.platform} application.

Layout configuration: ${config.layoutConfig || "default arrangement"}
Visual style: ${config.style} with ${config.theme} theme
Accent color: ${config.accent}
Typography: ${config.typeface}
${config.framing ? `Framing: ${config.framing}` : ""}
${config.animations.length > 0 ? `Animations: ${config.animations.join(", ")}` : ""}${customInstructions}

Create a polished, production-ready component that showcases this design configuration.`;
    }

    console.log("System prompt length:", systemPrompt.length);
    console.log("User prompt:", userPrompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Generate component error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
