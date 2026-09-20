import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateApplicationRequest {
  appliedAmount?: number;
  essay?: string;
  status?: string;
  reviewNotes?: string;
  additionalDocuments?: string[];
}

export const useUpdateApplication = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateApplicationRequest) => {
      const response = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to update application");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Application updated successfully");
      queryClient.invalidateQueries({ queryKey: ["application", id] });
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update application");
    },
  });
};
