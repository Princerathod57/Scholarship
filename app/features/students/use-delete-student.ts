import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to deactivate student");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Student deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to deactivate student");
    },
  });
};
