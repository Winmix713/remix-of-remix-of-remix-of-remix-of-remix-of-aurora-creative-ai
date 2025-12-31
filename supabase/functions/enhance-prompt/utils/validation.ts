import type { EnhanceRequestBody, ValidationResult, EnhanceMode } from "../types/index.ts";
import { logger } from "./logger.ts";

const MAX_CONTENT_LENGTH = 10000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_IMAGES = 5;
const VALID_MODES: EnhanceMode[] = ["formal", "creative", "technical", "marketing"];

export function validateRequest(body: unknown, requestId: string): ValidationResult {
  if (!body || typeof body !== "object") {
    logger.warn("Invalid request body format", { requestId, body });
    return { valid: false, error: "Érvénytelen kérés formátum", status: 400 };
  }

  const { content, mode, imageData } = body as EnhanceRequestBody;

  // Content validation
  if (content !== undefined) {
    if (typeof content !== "string") {
      logger.warn("Content field is not a string", { requestId });
      return { valid: false, error: "A 'content' mezőnek szövegnek kell lennie", status: 400 };
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      logger.warn("Content too long", { requestId, contentLength: content.length });
      return {
        valid: false,
        error: `A tartalom túl hosszú (max. ${MAX_CONTENT_LENGTH} karakter)`,
        status: 400,
      };
    }
  }

  // Mode validation
  if (mode !== undefined && !VALID_MODES.includes(mode)) {
    logger.warn("Invalid mode provided", { requestId, mode });
    return {
      valid: false,
      error: `Érvénytelen mód. Engedélyezett: ${VALID_MODES.join(", ")}`,
      status: 400,
    };
  }

  // Image validation
  if (imageData !== undefined) {
    const images = Array.isArray(imageData) ? imageData : [imageData];

    if (images.length > MAX_IMAGES) {
      logger.warn("Too many images uploaded", { requestId, imageCount: images.length });
      return {
        valid: false,
        error: `Maximum ${MAX_IMAGES} kép engedélyezett`,
        status: 400,
      };
    }

    for (const img of images) {
      if (typeof img !== "string") {
        logger.warn("Invalid image data format", { requestId });
        return { valid: false, error: "Érvénytelen képformátum", status: 400 };
      }

      // Data URL format check
      if (!img.startsWith("data:image/")) {
        logger.warn("Image is not a valid data URL", { requestId });
        return { valid: false, error: "Érvénytelen kép data URL", status: 400 };
      }

      // Base64 size estimation
      const base64Data = img.split(",")[1] || img;
      const estimatedSize = (base64Data.length * 3) / 4;
      if (estimatedSize > MAX_IMAGE_SIZE) {
        logger.warn("Image too large", { requestId, estimatedSize });
        return {
          valid: false,
          error: `Egy vagy több kép túl nagy (max. ${MAX_IMAGE_SIZE / 1024 / 1024} MB)`,
          status: 413,
        };
      }
    }
  }

  // At least content or imageData required
  if (!content?.trim() && !imageData) {
    logger.warn("No content or image data provided", { requestId });
    return { valid: false, error: "Tartalom vagy kép szükséges", status: 400 };
  }

  return { valid: true };
}
