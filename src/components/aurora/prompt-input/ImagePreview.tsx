import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageState } from "@/types/prompt";

interface ImagePreviewProps {
  image: ImageState;
  onRemove: () => void;
}

export const ImagePreview = ({ image, onRemove }: ImagePreviewProps) => (
  <div className="relative group" data-testid="image-preview">
    <img
      src={image.objectUrl}
      alt={image.name}
      loading="lazy"
      className={cn(
        "h-20 w-20 rounded-xl border border-border/50",
        "object-contain bg-black/30",
        "transition-transform hover:scale-105"
      )}
      onError={(e) => {
        e.currentTarget.src = "/placeholder.svg";
        e.currentTarget.alt = "Kép betöltése sikertelen";
        e.currentTarget.classList.add("bg-destructive/20");
      }}
    />
    <button
      onClick={onRemove}
      className="absolute -top-1 -right-1 p-1 bg-destructive/90 rounded-full hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100"
      aria-label="Kép eltávolítása"
    >
      <X className="w-3 h-3 text-destructive-foreground" />
    </button>
    <span className="absolute bottom-0 left-0 right-0 text-[0.6rem] text-center bg-black/70 text-white truncate px-1 rounded-b-xl">
      {image.name}
    </span>
  </div>
);
