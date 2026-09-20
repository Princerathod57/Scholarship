import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useRejectApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      reason, 
      reviewNotes 
    }: { 
      id: string; 
      reason: string; 
      reviewNotes?: string; 
    }) => {
      const response = await fetch(`/api/applications/${id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason, reviewNotes }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to reject application");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Application rejected");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject application");
    },
  });
};
