import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateProgramRequest {
  name?: string;
  description?: string;
  code?: string;
  department?: string;
  status?: string;
}

export const useUpdateProgram = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProgramRequest) => {
      const response = await fetch(`/api/programs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to update program");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Program updated successfully");
      queryClient.invalidateQueries({ queryKey: ["program", id] });
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update program");
    },
  });
};
