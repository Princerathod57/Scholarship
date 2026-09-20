import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateApplicationRequest {
  scholarshipId: string;
  studentId: string;
  appliedAmount?: number;
  essay?: string;
  additionalDocuments?: string[];
}

export const useCreateApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateApplicationRequest) => {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to create application");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Application submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit application");
    },
  });
};
