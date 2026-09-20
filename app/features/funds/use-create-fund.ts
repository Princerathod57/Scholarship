import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateFundRequest {
  name: string;
  description?: string;
  programId: string;
  totalAmount: number;
}

export const useCreateFund = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateFundRequest) => {
      const response = await fetch("/api/funds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to create fund");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Fund created successfully");
      queryClient.invalidateQueries({ queryKey: ["funds"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create fund");
    },
  });
};
