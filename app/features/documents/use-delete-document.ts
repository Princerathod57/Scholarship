import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useDeleteDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete document");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-statistics"] });
      queryClient.invalidateQueries({ queryKey: ["application-documents"] });
      queryClient.invalidateQueries({ queryKey: ["disbursement-documents"] });
      toast.success("Document deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
