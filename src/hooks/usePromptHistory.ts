import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { EnhanceMode } from "@/components/aurora/ModeSelector";

export interface PromptHistoryItem {
  id: string;
  original_content: string;
  enhanced_content: string;
  mode: EnhanceMode;
  file_type: string | null;
  created_at: string;
}

export function usePromptHistory() {
  const [history, setHistory] = useState<PromptHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("prompt_history")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setHistory((data as PromptHistoryItem[]) || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveToHistory = useCallback(async (
    originalContent: string,
    enhancedContent: string,
    mode: EnhanceMode,
    fileType?: string
  ) => {
    try {
      const { error } = await supabase.from("prompt_history").insert({
        original_content: originalContent.substring(0, 500), // Truncate for preview
        enhanced_content: enhancedContent,
        mode,
        file_type: fileType || null,
      });

      if (error) throw error;
      
      // Refresh history
      fetchHistory();
    } catch (error) {
      console.error("Error saving to history:", error);
    }
  }, [fetchHistory]);

  const deleteFromHistory = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from("prompt_history")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setHistory(prev => prev.filter(item => item.id !== id));
      toast.success("Előzmény törölve");
    } catch (error) {
      console.error("Error deleting from history:", error);
      toast.error("Nem sikerült törölni");
    }
  }, []);

  const clearAllHistory = useCallback(async () => {
    try {
      const { error } = await supabase
        .from("prompt_history")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all

      if (error) throw error;
      
      setHistory([]);
      toast.success("Előzmények törölve");
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Nem sikerült törölni az előzményeket");
    }
  }, []);

  return {
    history,
    isLoading,
    saveToHistory,
    deleteFromHistory,
    clearAllHistory,
    refreshHistory: fetchHistory,
  };
}
