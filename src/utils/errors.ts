/**
 * Utility function to format bytes to human readable format
 */
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Error thrown when file reading fails
 */
export class FileReadError extends Error {
  public readonly originalError?: Error;
  
  constructor(fileName: string, originalError?: Error) {
    super(`Hiba a "${fileName}" fájl beolvasásakor`);
    this.name = "FileReadError";
    this.originalError = originalError;
  }
}

/**
 * Error thrown when file size exceeds limit
 */
export class FileSizeError extends Error {
  constructor(fileName: string, size: number, maxSize: number) {
    super(
      `A "${fileName}" fájl túl nagy (${formatBytes(size)} / max. ${formatBytes(maxSize)})`
    );
    this.name = "FileSizeError";
  }
}

/**
 * Error thrown when file type is not supported
 */
export class UnsupportedFileTypeError extends Error {
  constructor(fileName: string, extension: string) {
    super(`A fájl "${extension}" kiterjesztése nem támogatott`);
    this.name = "UnsupportedFileTypeError";
  }
}

/**
 * API Error with status code
 */
export class ApiError extends Error {
  public readonly status: number;
  public readonly originalError?: Error;

  constructor(status: number, message: string, originalError?: Error) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.originalError = originalError;
  }
}

/**
 * Types of errors that can occur during prompt enhancement
 */
export type EnhanceErrorType =
  | "network"
  | "rate-limit"
  | "payment"
  | "invalid-content"
  | "content-too-long"
  | "timeout"
  | "server-error"
  | "generic"
  | "abort";

/**
 * Localized error messages for each error type
 */
export const ERROR_MESSAGES: Record<EnhanceErrorType, { hu: string; en: string }> = {
  network: {
    hu: "Hálózati hiba. Ellenőrizd az internetkapcsolatod.",
    en: "Network error. Please check your connection.",
  },
  "rate-limit": {
    hu: "Túl sok kérés. Kérlek várj egy percet.",
    en: "Too many requests. Please wait a moment.",
  },
  payment: {
    hu: "Elérted a használati limitet. Kérlek adj hozzá krediteket.",
    en: "Usage limit reached. Please add credits.",
  },
  "invalid-content": {
    hu: "Érvénytelen tartalom. Kérlek módosítsd a promptot.",
    en: "Invalid content. Please modify your prompt.",
  },
  "content-too-long": {
    hu: "A tartalom túl hosszú. Maximum 10,000 karakter engedélyezett.",
    en: "Content too long. Maximum 10,000 characters allowed.",
  },
  timeout: {
    hu: "A kérés időtúllépés miatt megszakadt. Próbáld újra.",
    en: "Request timed out. Please try again.",
  },
  "server-error": {
    hu: "Szerverhiba. Kérlek próbáld újra később.",
    en: "Server error. Please try again later.",
  },
  generic: {
    hu: "Ismeretlen hiba történt.",
    en: "An unknown error occurred.",
  },
  abort: {
    hu: "A kérés megszakítva.",
    en: "Request aborted.",
  },
};

/**
 * Classify an error into an EnhanceErrorType
 */
export function classifyEnhanceError(error: Error | ApiError): EnhanceErrorType {
  if (error.name === "AbortError") return "abort";
  
  if (error instanceof ApiError) {
    if (error.status === 429) return "rate-limit";
    if (error.status === 402) return "payment";
    if (error.status === 400) {
      if (error.message.includes("too long") || error.message.includes("content length")) {
        return "content-too-long";
      }
      return "invalid-content";
    }
    if (error.status === 408 || error.status === 504) return "timeout";
    if (error.status >= 500) return "server-error";
  }
  
  if (
    error.message.toLowerCase().includes("network") ||
    error.message.toLowerCase().includes("fetch")
  ) {
    return "network";
  }
  
  return "generic";
}
