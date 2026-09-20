import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateScholarshipRequest {
  name?: string;
  description?: string;
  category?: string;
  amount?: number;
  isVariableAmount?: boolean;
  minAmount?: number;
  maxAmount?: number;
  fundId?: string;
  programId?: string;
  requirements?: string;
  applicationDeadline?: string;
  status?: string;
  isRenewable?: boolean;
  maxRenewals?: number;
}

export const useUpdateScholarship = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateScholarshipRequest) => {
      const response = await fetch(`/api/scholarships/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to update scholarship");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Scholarship updated successfully");
      queryClient.invalidateQueries({ queryKey: ["scholarship", id] });
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update scholarship");
    },
  });
};
