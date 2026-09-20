import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateDisbursementRequest {
  awardId: string;
  amount: number;
  method: string;
  scheduledDate?: string;
  bankAccountId?: string;
  notes?: string;
}

export const useCreateDisbursement = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDisbursementRequest) => {
      const response = await fetch("/api/disbursements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to create disbursement");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Disbursement created successfully");
      queryClient.invalidateQueries({ queryKey: ["disbursements"] });
      queryClient.invalidateQueries({ queryKey: ["awards"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create disbursement");
    },
  });
};
