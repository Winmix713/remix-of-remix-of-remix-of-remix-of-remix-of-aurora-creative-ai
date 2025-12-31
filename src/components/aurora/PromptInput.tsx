import { useState, KeyboardEvent, ChangeEvent, useCallback, useMemo } from "react";
import { Upload, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { useFileUpload } from "@/hooks/useFileUpload";
import { ImagePreview } from "./prompt-input/ImagePreview";
import { FileBadge } from "./prompt-input/FileBadge";
import type { PromptInputProps } from "@/types/prompt";

const DEFAULT_MAX_CHARACTERS = 10000;
const ACCEPT_ALL_EXTENSIONS = ".md,.txt,.jpg,.jpeg,.png";

export function PromptInput({
  onSubmit,
  isLoading,
  initialValue = "",
  maxImages = 5,
  maxCharacters = DEFAULT_MAX_CHARACTERS,
  maxFileSizeMB = 5,
  maxTotalSizeMB = 20,
}: PromptInputProps) {
  const { t } = useLanguage();
  const [input, setInput] = useState(initialValue);
  const [isDragging, setIsDragging] = useState(false);

  const {
    images,
    fileName,
    fileType,
    fileInputRef,
    handleFileChange,
    removeImage,
    clearFile,
    getBase64Images,
    openFilePicker,
    maxImages: actualMaxImages,
  } = useFileUpload({ maxImages, maxFileSizeMB, maxTotalSizeMB });

  const handleSubmit = async () => {
    if ((input.trim() || images.length > 0) && !isLoading) {
      const imageData = images.length > 0 ? await getBase64Images() : undefined;
      onSubmit(input.trim(), fileType || undefined, imageData);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= maxCharacters) {
      setInput(newText);
    } else {
      toast.warning(`Maximum ${maxCharacters.toLocaleString()} karakter engedélyezett`);
      setInput(newText.substring(0, maxCharacters));
    }
  };

  const charCount = input.length;
  const charPercentage = charCount / maxCharacters;
  const isNearLimit = charPercentage >= 0.9 && charCount < maxCharacters;
  const isOverLimit = charCount >= maxCharacters;

  // Memoized rendered images
  const renderedImages = useMemo(
    () =>
      images.map((img, index) => (
        <ImagePreview
          key={`${img.name}-${index}`}
          image={img}
          onRemove={() => removeImage(index)}
        />
      )),
    [images, removeImage]
  );

  // Drag & Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const dataTransferFiles = e.dataTransfer.files;
      if (dataTransferFiles.length > 0) {
        const mockEvent = {
          target: { files: dataTransferFiles },
        } as ChangeEvent<HTMLInputElement>;
        handleFileChange(mockEvent);
      }
    },
    [handleFileChange]
  );

  return (
    <div
      className={cn(
        "w-full max-w-4xl bg-surface-dark rounded-[2rem] p-3 shadow-2xl shadow-aurora-purple/20 relative z-20 mx-auto transition-all focus-within:ring-4 focus-within:ring-aurora-purple/20",
        isDragging && "ring-2 ring-aurora-purple bg-aurora-purple/10"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-testid="drop-zone"
    >
      {/* Drag overlay */}
      {isDragging && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[2rem] z-10">
          <div className="text-white text-lg font-medium flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Húzd ide a fájlokat
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {/* Image Previews */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mx-4 mt-2">
            {renderedImages}
            {images.length < actualMaxImages && (
              <button
                onClick={openFilePicker}
                className="h-20 w-20 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-aurora-purple flex items-center justify-center transition-colors"
                aria-label="További képek hozzáadása"
              >
                <Upload className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        )}

        {/* Textarea Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow bg-surface-dark-elevated rounded-2xl p-4 sm:p-5 flex flex-col group transition-colors hover:bg-surface-dark-hover relative">
            <label htmlFor="ai-prompt" className="sr-only">
              {t.placeholder}
            </label>
            <textarea
              id="ai-prompt"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              disabled={isLoading}
              rows={6}
              className="w-full bg-transparent border-none outline-none text-lg text-foreground placeholder-muted-foreground font-medium disabled:opacity-50 resize-none no-scrollbar"
            />

            <div className="flex justify-between items-end mt-4 pt-3 border-t border-border/50">
              <div className="flex items-center gap-3 flex-wrap">
                {/* File Upload Button */}
                <button
                  onClick={openFilePicker}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-dark hover:bg-white hover:text-black transition-colors text-muted-foreground text-sm"
                  aria-label={t.fileButton}
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.fileButton}</span>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPT_ALL_EXTENSIONS}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />

                {/* File Badge - only for text files */}
                {fileName && images.length === 0 && (
                  <FileBadge fileName={fileName} onClear={clearFile} />
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span
                  className={cn(
                    "font-mono transition-colors",
                    isOverLimit && "text-destructive font-bold animate-pulse",
                    isNearLimit && !isOverLimit && "text-yellow-500",
                    !isNearLimit && "text-muted-foreground"
                  )}
                >
                  {charCount.toLocaleString()} / {maxCharacters.toLocaleString()}
                  {isOverLimit && (
                    <span className="ml-2 text-xs">
                      ({(charCount - maxCharacters).toLocaleString()} túl)
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground/50">|</span>
                <span className="text-muted-foreground/70">PromptCraft 2.0</span>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || (!input.trim() && images.length === 0) || isOverLimit}
            className="h-20 sm:h-auto sm:w-24 bg-gradient-to-br from-aurora-purple to-aurora-pink rounded-2xl flex flex-col items-center justify-center hover:opacity-90 active:scale-95 transition-all cursor-pointer shrink-0 shadow-lg group disabled:opacity-50 disabled:cursor-not-allowed text-white gap-1"
            aria-label={t.enhance}
          >
            {isLoading ? (
              <Loader2 className="w-8 h-8 animate-spin" />
            ) : (
              <>
                <Sparkles className="w-8 h-8 transition-transform group-hover:rotate-12 duration-300" />
                <span className="text-xs font-medium">{t.enhance}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
