import type { EnhanceRequestBody } from "../types/index.ts";
import { MODE_PROMPTS, BASE_INSTRUCTIONS } from "../prompts/modes.ts";
import { logger } from "../utils/logger.ts";
import { fetchWithRetry } from "../utils/retry.ts";
import { processImages } from "../utils/imageProcessor.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const AI_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export async function handleEnhanceRequest(
  body: EnhanceRequestBody,
  requestId: string
): Promise<Response> {
  const { content, mode = "formal", imageData } = body;

  logger.info("Processing enhance request", {
    requestId,
    mode,
    hasContent: !!content?.trim(),
    hasImages: !!imageData,
  });

  if (!LOVABLE_API_KEY) {
    logger.error("LOVABLE_API_KEY is not configured", null, { requestId });
    return new Response(
      JSON.stringify({ error: "API kulcs nincs konfigurálva" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const modePrompt = MODE_PROMPTS[mode] || MODE_PROMPTS.formal;
  const systemPrompt = modePrompt + BASE_INSTRUCTIONS;

  const userContent: Array<{ type: string; text?: string; image_url?: { url: string } }> = [];
  let imagesToProcess: string[] = [];

  if (imageData) {
    imagesToProcess = Array.isArray(imageData) ? imageData : [imageData];
    const { processed, errors } = processImages(imagesToProcess, requestId);
    if (errors.length > 0) {
      logger.warn("Image processing errors found", { requestId, errors });
      return new Response(
        JSON.stringify({ error: errors.join("; ") }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    imagesToProcess = processed.map((img) => img.url);
  }

  const hasImages = imagesToProcess.length > 0;
  const hasText = content && content.trim().length > 0;

  if (hasImages && hasText) {
    userContent.push({
      type: "text",
      text: `Please enhance the following prompt based on BOTH the text content AND the attached image(s). Analyze what's visible in the image(s) and incorporate relevant visual details, design elements, colors, layout patterns, and any text/content shown. Create a comprehensive, enhanced prompt that combines the user's written intent with the visual reference(s).

User's prompt:
---
${content}
---

Create an enhanced prompt that describes exactly what's needed, incorporating details from both the text and the visual reference(s) above.`,
    });
    for (const img of imagesToProcess) {
      userContent.push({ type: "image_url", image_url: { url: img } });
    }
  } else if (hasImages) {
    userContent.push({
      type: "text",
      text: `Please analyze ${imagesToProcess.length > 1 ? "these images" : "this image"} and create a professional, well-structured prompt based on ${imagesToProcess.length > 1 ? "their" : "its"} content. Describe the visual elements, layout, colors, typography, and any design patterns you observe. Create a prompt that would help recreate or build upon what's shown.`,
    });
    for (const img of imagesToProcess) {
      userContent.push({ type: "image_url", image_url: { url: img } });
    }
  } else {
    userContent.push({
      type: "text",
      text: `Please enhance the following content into a professional, well-structured prompt:\n\n---\n${content}\n---\n\nCreate an enhanced, professional prompt version of this content.`,
    });
  }

  try {
    const response = await fetchWithRetry(
      AI_GATEWAY_URL,
      {
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
      },
      { requestId }
    );

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("AI gateway error", null, { requestId, status: response.status, errorText });

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Túl sok kérés. Kérlek próbáld újra egy pillanat múlva." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Elérted a használati limitet. Kérlek adj hozzá krediteket." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ error: "AI szolgáltatás átmenetileg nem elérhető" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    logger.info("Streaming response from AI gateway", { requestId });

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    logger.error("Error calling AI gateway", error as Error, { requestId });
    return new Response(
      JSON.stringify({ error: "Hiba az AI szolgáltatás hívásakor" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
