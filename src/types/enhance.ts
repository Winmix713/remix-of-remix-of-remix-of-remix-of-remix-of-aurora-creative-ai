export type EnhanceMode = "formal" | "creative" | "technical" | "marketing";

export const ENHANCE_MODE_LABELS: Record<EnhanceMode, { hu: string; en: string }> = {
  formal: { hu: "Formális", en: "Formal" },
  creative: { hu: "Kreatív", en: "Creative" },
  technical: { hu: "Technikai", en: "Technical" },
  marketing: { hu: "Marketing", en: "Marketing" },
};

export type LoadingStage = "connecting" | "analyzing" | "enhancing" | "finalizing";

export interface EnhanceResult {
  result: string;
  mode: EnhanceMode;
  fileType?: string;
  originalContent: string;
  tokenCount?: number;
  processingTime?: number;
}
