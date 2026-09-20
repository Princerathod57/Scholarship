import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateProgramRequest {
  name: string;
  description?: string;
  code: string;
  department?: string;
  status?: string;
}

export const useCreateProgram = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProgramRequest) => {
      const response = await fetch("/api/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to create program");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Program created successfully");
      queryClient.invalidateQueries({ queryKey: ["programs"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create program");
    },
  });
};
