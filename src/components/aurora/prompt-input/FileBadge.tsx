import { FileText, X } from "lucide-react";

interface FileBadgeProps {
  fileName: string;
  onClear: () => void;
}

export const FileBadge = ({ fileName, onClear }: FileBadgeProps) => (
  <div className="flex items-center gap-1.5 px-2 py-1 bg-aurora-purple/20 rounded-full text-aurora-purple text-xs">
    <FileText className="w-3 h-3" />
    <span className="max-w-[100px] truncate">{fileName}</span>
    <button 
      onClick={onClear} 
      className="hover:text-white transition-colors" 
      aria-label="Fájl eltávolítása"
    >
      <X className="w-3 h-3" />
    </button>
  </div>
);
