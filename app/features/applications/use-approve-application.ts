import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useApproveApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      awardedAmount, 
      reviewNotes 
    }: { 
      id: string; 
      awardedAmount?: number; 
      reviewNotes?: string; 
    }) => {
      const response = await fetch(`/api/applications/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ awardedAmount, reviewNotes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to approve application");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Application approved successfully");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve application");
    },
  });
};
