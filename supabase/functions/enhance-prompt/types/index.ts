export type EnhanceMode = "formal" | "creative" | "technical" | "marketing";

export interface EnhanceRequestBody {
  content?: string;
  mode?: EnhanceMode;
  imageData?: string | string[];
}

export interface ImageMetaData {
  url: string;
  estimatedSize: number;
  mimeType: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  status?: number;
}

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp?: string;
  requestId?: string;
  duration?: number;
  status?: number;
  ip?: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  metadata?: Record<string, unknown>;
}
