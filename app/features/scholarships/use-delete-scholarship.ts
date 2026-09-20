import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteScholarship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/scholarships/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to delete scholarship");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Scholarship deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete scholarship");
    },
  });
};
