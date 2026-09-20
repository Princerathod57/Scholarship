import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useActivateAward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/awards/${id}/activate`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to activate award");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Award activated successfully");
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to activate award");
    },
  });
};
