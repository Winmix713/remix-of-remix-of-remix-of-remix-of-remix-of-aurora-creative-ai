import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { EnhanceMode } from "@/types/enhance";

/**
 * Prompt előzmény rekord típusa
 */
export interface PromptHistoryItem {
  id: string;
  original_content: string;
  enhanced_content: string;
  mode: EnhanceMode;
  file_type: string | null;
  created_at: string;
}

/**
 * Új prompt előzmény beszúrásához szükséges adatok
 */
export interface InsertPromptHistory {
  original_content: string;
  enhanced_content: string;
  mode: EnhanceMode;
  file_type?: string | null;
}

export function usePromptHistory() {
  const { data: history = [], isLoading } = useQuery<PromptHistoryItem[]>({
    queryKey: ["prompt-history"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prompt_history")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return (data || []) as PromptHistoryItem[];
    },
  });

  const saveToHistoryMutation = useMutation({
    mutationFn: async (item: InsertPromptHistory) => {
      const { data, error } = await supabase
        .from("prompt_history")
        .insert({
          original_content: item.original_content,
          enhanced_content: item.enhanced_content,
          mode: item.mode,
          file_type: item.file_type || null,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
  });

  const deleteFromHistoryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("prompt_history")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Elem törölve");
    },
  });

  const clearAllHistoryMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("prompt_history")
        .delete()
        .neq("id", "");
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Előzmények törölve");
    },
  });

  const saveToHistory = (
    originalContent: string,
    enhancedContent: string,
    mode: EnhanceMode,
    fileType?: string
  ) => {
    saveToHistoryMutation.mutate({
      original_content: originalContent,
      enhanced_content: enhancedContent,
      mode,
      file_type: fileType || null,
    });
  };

  return {
    history,
    isLoading,
    saveToHistory,
    deleteFromHistory: (id: string) => deleteFromHistoryMutation.mutate(id),
    clearAllHistory: () => clearAllHistoryMutation.mutate(),
  };
}
