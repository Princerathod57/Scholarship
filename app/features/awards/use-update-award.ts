import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateAwardRequest {
  awardedAmount?: number;
  status?: string;
  notes?: string;
  expiryDate?: string;
}

export const useUpdateAward = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateAwardRequest) => {
      const response = await fetch(`/api/awards/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to update award");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Award updated successfully");
      queryClient.invalidateQueries({ queryKey: ["award", id] });
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update award");
    },
  });
};
