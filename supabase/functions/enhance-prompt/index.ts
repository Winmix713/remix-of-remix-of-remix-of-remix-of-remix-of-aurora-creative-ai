import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODE_PROMPTS: Record<string, string> = {
  formal: `You are Aurora, an expert prompt engineer specializing in FORMAL, PROFESSIONAL content.
Transform user content into well-structured, business-appropriate prompts with:
- Clear, precise language and professional tone
- Proper structure with objectives, context, and expected outcomes
- Industry-standard terminology where appropriate
- Concise yet comprehensive formatting`,

  creative: `You are Aurora, an expert prompt engineer specializing in CREATIVE, IMAGINATIVE content.
Transform user content into engaging, creative prompts with:
- Vivid, expressive language and unique perspectives
- Metaphors, analogies, and storytelling elements
- Open-ended possibilities for innovative responses
- Engaging narrative flow that inspires creativity`,

  technical: `You are Aurora, an expert prompt engineer specializing in TECHNICAL, PRECISE content.
Transform user content into detailed technical prompts with:
- Exact specifications and technical terminology
- Step-by-step structured requirements
- Clear parameters, constraints, and acceptance criteria
- Code examples or technical formats where applicable`,

  marketing: `You are Aurora, an expert prompt engineer specializing in MARKETING, PERSUASIVE content.
Transform user content into compelling marketing prompts with:
- Persuasive, benefit-focused language
- Clear value propositions and calls-to-action
- Emotional triggers and engagement hooks
- Target audience awareness and conversion optimization`,
};

const BASE_INSTRUCTIONS = `
When given any content (text, document content, or image description), you will:
1. Analyze the core intent and key information
2. Structure it into a clear, professional prompt
3. Add relevant context and specificity
4. Ensure the prompt is actionable and results-oriented
5. Keep the original meaning but enhance clarity and effectiveness

Output format:
- Start with a clear objective statement
- Include relevant context and constraints
- Specify desired output format if applicable
- Add any helpful details that improve AI understanding

Respond in the same language as the input content.
Be concise but comprehensive. Focus on quality over length.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, mode = "formal", imageData } = await req.json();
    
    console.log("Received enhance request, mode:", mode, "content length:", content?.length, "has image:", !!imageData);
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const modePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.formal;
    const systemPrompt = modePrompt + BASE_INSTRUCTIONS;

    // Build messages array - handle text, image, or both together
    const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
    
    // Check if we have images (can be single or array)
    const images = Array.isArray(imageData) ? imageData : (imageData ? [imageData] : []);
    const hasImages = images.length > 0;
    const hasText = content && content.trim().length > 0;
    
    if (hasImages && hasText) {
      // Both text AND images - combine them for comprehensive enhancement
      userContent.push({
        type: "text",
        text: `Please enhance the following prompt based on BOTH the text content AND the attached image(s). Analyze what's visible in the image(s) and incorporate relevant visual details, design elements, colors, layout patterns, and any text/content shown. Create a comprehensive, enhanced prompt that combines the user's written intent with the visual reference(s).

User's prompt:
---
${content}
---

Create an enhanced prompt that describes exactly what's needed, incorporating details from both the text and the visual reference(s) above.`
      });
      // Add all images
      for (const img of images) {
        userContent.push({
          type: "image_url",
          image_url: { url: img }
        });
      }
    } else if (hasImages) {
      // Only image(s) - analyze and create prompt from visual content
      userContent.push({
        type: "text",
        text: `Please analyze ${images.length > 1 ? 'these images' : 'this image'} and create a professional, well-structured prompt based on ${images.length > 1 ? 'their' : 'its'} content. Describe the visual elements, layout, colors, typography, and any design patterns you observe. Create a prompt that would help recreate or build upon what's shown.`
      });
      for (const img of images) {
        userContent.push({
          type: "image_url",
          image_url: { url: img }
        });
      }
    } else {
      // Only text - enhance the written prompt
      userContent.push({
        type: "text",
        text: `Please enhance the following content into a professional, well-structured prompt:\n\n---\n${content}\n---\n\nCreate an enhanced, professional prompt version of this content.`
      });
    }

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
          { role: "user", content: userContent },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Túl sok kérés. Kérlek próbáld újra egy pillanat múlva." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Elérted a használati limitet. Kérlek adj hozzá krediteket." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI szolgáltatás átmenetileg nem elérhető" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from AI gateway");
    
    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Enhance function error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Ismeretlen hiba" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
