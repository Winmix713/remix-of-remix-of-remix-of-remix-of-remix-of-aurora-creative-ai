import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleEnhanceRequest } from "./handlers/enhance.ts";
import { validateRequest } from "./utils/validation.ts";
import { checkRateLimit } from "./utils/rateLimiter.ts";
import { logger } from "./utils/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimit = checkRateLimit(ip, requestId);

    if (!rateLimit.allowed) {
      logger.warn("Rate limit exceeded", { requestId, ip });
      return new Response(
        JSON.stringify({ error: "Túl sok kérés. Kérlek várj egy percet." }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": Math.ceil(rateLimit.resetIn / 1000).toString(),
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
          },
        }
      );
    }

    // Parse request body
    let body;
    try {
      body = await req.json();
    } catch {
      logger.warn("Failed to parse request body", { requestId });
      return new Response(
        JSON.stringify({ error: "Érvénytelen JSON formátum" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate request
    const validation = validateRequest(body, requestId);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: validation.status || 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Handle the enhance request
    const response = await handleEnhanceRequest(body, requestId);

    // Log request completion
    const duration = Date.now() - startTime;
    logger.request(req, response.status, duration, requestId);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("Unhandled error in enhance function", error as Error, { requestId, duration });

    return new Response(
      JSON.stringify({ error: "Ismeretlen hiba történt" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
