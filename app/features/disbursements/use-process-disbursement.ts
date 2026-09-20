import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useProcessDisbursement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/disbursements/${id}/process`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to process disbursement");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Disbursement processed successfully");
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process disbursement");
    },
  });
};
