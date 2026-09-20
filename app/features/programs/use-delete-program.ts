import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/programs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to delete program");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Program deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete program");
    },
  });
};
