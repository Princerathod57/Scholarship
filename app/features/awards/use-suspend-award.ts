import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useSuspendAward = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await fetch(`/api/awards/${id}/suspend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to suspend award");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Award suspended successfully");
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to suspend award");
    },
  });
};
