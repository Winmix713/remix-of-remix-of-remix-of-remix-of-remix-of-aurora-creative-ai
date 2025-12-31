import { useState, useRef, useCallback, ChangeEvent, useEffect } from "react";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  FileReadError,
  FileSizeError,
  UnsupportedFileTypeError,
} from "@/utils/errors";
import type { ImageState, FileType } from "@/types/prompt";

interface UseFileUploadOptions {
  maxImages?: number;
  maxFileSizeMB?: number;
  maxTotalSizeMB?: number;
  acceptedExtensions?: string[];
  imageExtensions?: string[];
}

const DEFAULT_MAX_IMAGES = 5;
const DEFAULT_MAX_FILE_SIZE_MB = 5;
const DEFAULT_MAX_TOTAL_SIZE_MB = 20;
const DEFAULT_ACCEPTED_EXTENSIONS = [".md", ".txt", ".jpg", ".jpeg", ".png"];
const DEFAULT_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png"];

export function useFileUpload(options?: UseFileUploadOptions) {
  const { t } = useLanguage();
  const [images, setImages] = useState<ImageState[]>([]);
  const [textContent, setTextContent] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxImages = options?.maxImages ?? DEFAULT_MAX_IMAGES;
  const maxFileSize = (options?.maxFileSizeMB ?? DEFAULT_MAX_FILE_SIZE_MB) * 1024 * 1024;
  const maxTotalSize = (options?.maxTotalSizeMB ?? DEFAULT_MAX_TOTAL_SIZE_MB) * 1024 * 1024;
  const acceptedExtensions = options?.acceptedExtensions ?? DEFAULT_ACCEPTED_EXTENSIONS;
  const imageExtensions = options?.imageExtensions ?? DEFAULT_IMAGE_EXTENSIONS;

  /**
   * Read file as Base64 data URL
   */
  const readImageAsBase64 = useCallback((file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new FileReadError(file.name, reader.error ?? undefined));
      reader.readAsDataURL(file);
    });
  }, []);

  /**
   * Handle text file upload with DOMPurify sanitization
   */
  const handleTextFile = useCallback(
    async (file: File): Promise<void> => {
      const rawText = await file.text();

      // XSS protection: sanitize text content
      const sanitizedText = DOMPurify.sanitize(rawText, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
      });

      if (rawText !== sanitizedText) {
        console.warn(`Potentially dangerous content removed from: ${file.name}`);
        toast.warning("Potenciálisan veszélyes tartalom eltávolítva a szövegből.");
      }

      setTextContent((prev) =>
        prev ? `${prev}\n\n--- ${file.name} ---\n${sanitizedText}` : sanitizedText
      );
      setFileName(file.name);
      setFileType("text");
      toast.success(`${file.name} ${t.fileLoaded}`);
    },
    [t]
  );

  /**
   * Handle image file upload using Object URL for memory optimization
   */
  const handleImageFile = useCallback(
    async (file: File) => {
      if (images.length >= maxImages) {
        toast.warning(`Maximum ${maxImages} kép tölthető fel`);
        return;
      }
      
      const objectUrl = URL.createObjectURL(file);
      setImages((prev) => [
        ...prev,
        { 
          data: "", // Empty until submission
          name: file.name, 
          size: file.size, 
          file, 
          objectUrl 
        },
      ]);
      setFileType("image");
      toast.success(`${file.name} ${t.imageLoaded}`);
    },
    [images.length, maxImages, t]
  );

  /**
   * Handle file input change event
   */
  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const filesToProcess = Array.from(files);
      let currentTotalSize = images.reduce((sum, img) => sum + img.size, 0);

      for (const file of filesToProcess) {
        const extension = "." + file.name.split(".").pop()?.toLowerCase();

        try {
          if (!acceptedExtensions.includes(extension)) {
            throw new UnsupportedFileTypeError(file.name, extension);
          }

          if (file.size > maxFileSize) {
            throw new FileSizeError(file.name, file.size, maxFileSize);
          }

          if (currentTotalSize + file.size > maxTotalSize) {
            toast.warning(`Elérted a maximális összes feltöltési limitet`);
            break;
          }
          currentTotalSize += file.size;

          if (imageExtensions.includes(extension)) {
            await handleImageFile(file);
          } else {
            await handleTextFile(file);
          }
        } catch (error) {
          if (error instanceof FileReadError) {
            toast.error(t.fileReadError);
            console.error(error);
          } else if (error instanceof FileSizeError) {
            toast.warning(error.message);
          } else if (error instanceof UnsupportedFileTypeError) {
            toast.error(t.supportedFormats);
          } else if (error instanceof DOMException && error.name === "AbortError") {
            toast.info("Fájlművelet megszakítva");
          } else if (error instanceof Error) {
            toast.error(error.message);
          } else {
            console.error("Unknown file processing error:", error);
            toast.error("Ismeretlen hiba a fájl feldolgozása során");
          }
        }
      }

      e.target.value = "";
    },
    [
      acceptedExtensions,
      imageExtensions,
      maxFileSize,
      maxTotalSize,
      images,
      handleImageFile,
      handleTextFile,
      t,
    ]
  );

  /**
   * Remove an image by index and revoke its Object URL
   */
  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed?.objectUrl) {
        URL.revokeObjectURL(removed.objectUrl);
      }
      const newImages = prev.filter((_, i) => i !== index);
      
      // Reset fileType if no images left
      if (newImages.length === 0) {
        setFileType((prevType) => prevType === "image" ? null : prevType);
      }
      
      return newImages;
    });
  }, []);

  /**
   * Clear all file state
   */
  const clearFile = useCallback(() => {
    setFileName(null);
    setFileType(null);
    setTextContent("");
    images.forEach((img) => URL.revokeObjectURL(img.objectUrl));
    setImages([]);
  }, [images]);

  /**
   * Convert all images to Base64 for submission
   */
  const getBase64Images = useCallback(async (): Promise<string[]> => {
    const base64Promises = images.map((img) => readImageAsBase64(img.file));
    return Promise.all(base64Promises);
  }, [images, readImageAsBase64]);

  // Cleanup effect for object URLs
  useEffect(() => {
    return () => {
      images.forEach((img) => {
        if (img.objectUrl) URL.revokeObjectURL(img.objectUrl);
      });
    };
  }, [images]);

  return {
    images,
    textContent,
    fileName,
    fileType,
    fileInputRef,
    handleFileChange,
    removeImage,
    clearFile,
    getBase64Images,
    openFilePicker: () => fileInputRef.current?.click(),
    maxImages,
  };
}
