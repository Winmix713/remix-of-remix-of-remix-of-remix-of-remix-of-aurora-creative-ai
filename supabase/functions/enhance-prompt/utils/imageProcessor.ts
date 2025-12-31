import type { ImageMetaData } from "../types/index.ts";
import { logger } from "./logger.ts";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

export function processImages(
  imageData: string | string[],
  requestId: string
): { processed: ImageMetaData[]; errors: string[] } {
  const images = Array.isArray(imageData) ? imageData : [imageData];
  const processed: ImageMetaData[] = [];
  const errors: string[] = [];

  for (const img of images) {
    if (typeof img !== "string" || !img.startsWith("data:image/")) {
      errors.push("Érvénytelen kép data URL formátum.");
      logger.warn("Invalid image data URL during processing", { requestId });
      continue;
    }

    const mimeMatch = img.match(/^data:image\/(?<mime>png|jpeg|jpg|gif|webp);base64,/i);
    if (!mimeMatch) {
      errors.push("Nem támogatott képformátum (engedélyezett: PNG, JPEG, GIF, WebP).");
      logger.warn("Unsupported image MIME type", { requestId });
      continue;
    }

    const mimeType = `image/${mimeMatch.groups!.mime.toLowerCase()}`;
    const base64Data = img.split(",")[1];
    const estimatedSize = (base64Data.length * 3) / 4;

    if (estimatedSize > MAX_IMAGE_SIZE) {
      errors.push(
        `A kép túl nagy: ${(estimatedSize / 1024 / 1024).toFixed(1)} MB (max. ${MAX_IMAGE_SIZE / 1024 / 1024} MB)`
      );
      logger.warn("Image exceeds max size during processing", { requestId, estimatedSize });
      continue;
    }

    processed.push({
      url: img,
      estimatedSize,
      mimeType,
    });
  }

  return { processed, errors };
}
