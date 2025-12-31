import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { PromptHistory, InsertPromptHistory } from "@shared/schema";
import { toast } from "sonner";

export function usePromptHistory() {
  const { data: history = [], isLoading } = useQuery<PromptHistory[]>({
    queryKey: ["/api/prompt-history"],
  });

  const saveToHistoryMutation = useMutation({
    mutationFn: async (item: InsertPromptHistory) => {
      const res = await apiRequest("POST", "/api/prompt-history", item);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompt-history"] });
    },
  });

  const deleteFromHistoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/prompt-history/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompt-history"] });
      toast.success("Elem törölve");
    },
  });

  const clearAllHistoryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/prompt-history/clear");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prompt-history"] });
      toast.success("Előzmények törölve");
    },
  });

  const saveToHistory = (
    originalContent: string,
    enhancedContent: string,
    mode: any,
    fileType?: string
  ) => {
    saveToHistoryMutation.mutate({
      originalContent,
      enhancedContent,
      mode,
      fileType: fileType || null,
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
