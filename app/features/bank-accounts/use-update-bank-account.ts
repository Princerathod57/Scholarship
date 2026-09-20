import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateBankAccountData {
  bankName?: string;
  accountNumber?: string;
  routingNumber?: string;
  branchName?: string;
  accountType?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateBankAccountData }) => {
      const response = await fetch(`/api/bank/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update bank account");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["bank-account", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["institutional-bank-accounts"] });
      toast.success("Bank account updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
