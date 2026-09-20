import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateDocumentData {
  fileName: string;
  originalFileName: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  description?: string;
  applicationId?: string;
  disbursementId?: string;
  uploadedBy: string;
}

export const useCreateDocument = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateDocumentData) => {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create document");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["document-statistics"] });
      
      if (variables.applicationId) {
        queryClient.invalidateQueries({ 
          queryKey: ["application-documents", variables.applicationId] 
        });
      }
      
      if (variables.disbursementId) {
        queryClient.invalidateQueries({ 
          queryKey: ["disbursement-documents", variables.disbursementId] 
        });
      }
      
      toast.success("Document uploaded successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
