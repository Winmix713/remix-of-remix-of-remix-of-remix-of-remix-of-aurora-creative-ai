import { useState, useRef, KeyboardEvent, ChangeEvent } from "react";
import { Upload, Sparkles, FileText, X, Loader2, Image } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface PromptInputProps {
  onSubmit: (content: string, fileType?: string, imageData?: string | string[]) => void;
  isLoading: boolean;
  initialValue?: string;
}

const ACCEPTED_EXTENSIONS = [".md", ".txt", ".jpg", ".jpeg", ".png"];
const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];
const MAX_IMAGES = 5;

export function PromptInput({ onSubmit, isLoading, initialValue = "" }: PromptInputProps) {
  const { t } = useLanguage();
  const [input, setInput] = useState(initialValue);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<string | null>(null);
  const [images, setImages] = useState<{ data: string; name: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    if ((input.trim() || images.length > 0) && !isLoading) {
      const imageData = images.length > 0 ? images.map(img => img.data) : undefined;
      onSubmit(input.trim(), fileType || undefined, imageData);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const readImageAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const extension = "." + file.name.split(".").pop()?.toLowerCase();
      
      if (!ACCEPTED_EXTENSIONS.some(ext => extension === ext)) {
        toast.error(t.supportedFormats);
        continue;
      }

      try {
        // Handle images
        if (IMAGE_EXTENSIONS.includes(extension)) {
          if (images.length >= MAX_IMAGES) {
            toast.error(`Maximum ${MAX_IMAGES} kép tölthető fel`);
            break;
          }
          const base64 = await readImageAsBase64(file);
          setImages(prev => [...prev, { data: base64, name: file.name }]);
          setFileType("image");
          toast.success(`${file.name} ${t.imageLoaded}`);
        }
        // Handle text files
        else {
          const text = await file.text();
          setInput(prev => prev ? `${prev}\n\n--- ${file.name} ---\n${text}` : text);
          setFileName(file.name);
          setFileType("text");
          toast.success(`${file.name} ${t.fileLoaded}`);
        }
      } catch (error) {
        console.error("File read error:", error);
        toast.error(t.fileReadError);
      }
    }

    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearFile = () => {
    setFileName(null);
    setFileType(null);
    setImages([]);
  };

  const charCount = input.length;

  const getFileIcon = () => {
    return <FileText className="w-3 h-3" />;
  };

  return (
    <div className="w-full max-w-4xl bg-surface-dark rounded-[2rem] p-3 shadow-2xl shadow-aurora-purple/20 relative z-20 mx-auto transition-all focus-within:ring-4 focus-within:ring-aurora-purple/20">
      <div className="flex flex-col gap-3">
        {/* Image Previews - Multiple images */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mx-4 mt-2">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img 
                  src={img.data} 
                  alt={img.name} 
                  className="h-20 w-20 rounded-xl object-cover border border-gray-700"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 p-1 bg-red-500/90 rounded-full hover:bg-red-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
                <span className="absolute bottom-0 left-0 right-0 text-[0.6rem] text-center bg-black/70 text-white truncate px-1 rounded-b-xl">
                  {img.name}
                </span>
              </div>
            ))}
            {images.length < MAX_IMAGES && (
              <button
                onClick={handleFileClick}
                className="h-20 w-20 rounded-xl border-2 border-dashed border-gray-600 hover:border-aurora-purple flex items-center justify-center transition-colors"
              >
                <Upload className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Textarea Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-grow bg-surface-dark-elevated rounded-2xl p-4 sm:p-5 flex flex-col group transition-colors hover:bg-surface-dark-hover relative">
            <label htmlFor="ai-prompt" className="sr-only">{t.placeholder}</label>
            <textarea 
              id="ai-prompt"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              disabled={isLoading}
              rows={6}
              className="w-full bg-transparent border-none outline-none text-lg text-gray-100 placeholder-gray-500 font-medium disabled:opacity-50 resize-none no-scrollbar"
            />
            
            <div className="flex justify-between items-end mt-4 pt-3 border-t border-gray-700/50">
              <div className="flex items-center gap-3 flex-wrap">
                {/* File Upload Button */}
                <button 
                  onClick={handleFileClick}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-dark hover:bg-white hover:text-black transition-colors text-gray-400 text-sm" 
                  aria-label={t.fileButton}
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.fileButton}</span>
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md,.txt,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />

                {/* File Badge - only for text files */}
                {fileName && images.length === 0 && (
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-aurora-purple/20 rounded-full text-aurora-purple text-xs">
                    {getFileIcon()}
                    <span className="max-w-[100px] truncate">{fileName}</span>
                    <button onClick={clearFile} className="hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span>{charCount.toLocaleString()} {t.characters}</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-400">PromptCraft 2.0</span>
              </div>
            </div>
          </div>
          
          {/* Generate Button */}
          <button 
            onClick={handleSubmit}
            disabled={isLoading || (!input.trim() && images.length === 0)}
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
