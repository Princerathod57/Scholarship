import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateBankAccountData {
  bankName: string;
  accountNumber: string;
  routingNumber?: string;
  branchName?: string;
  accountType?: string;
  isInstitutional?: boolean;
  studentId?: string;
  isDefault?: boolean;
}

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBankAccountData) => {
      const response = await fetch("/api/bank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create bank account");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bank-accounts"] });
      queryClient.invalidateQueries({ queryKey: ["institutional-bank-accounts"] });
      toast.success("Bank account created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
