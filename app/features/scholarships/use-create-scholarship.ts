import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateScholarshipRequest {
  name: string;
  description?: string;
  category: string;
  amount: number;
  isVariableAmount?: boolean;
  minAmount?: number;
  maxAmount?: number;
  fundId: string;
  programId?: string;
  requirements?: string;
  applicationDeadline?: string;
  isRenewable?: boolean;
  maxRenewals?: number;
}

export const useCreateScholarship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateScholarshipRequest) => {
      const response = await fetch("/api/scholarships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to create scholarship");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Scholarship created successfully");
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create scholarship");
    },
  });
};
