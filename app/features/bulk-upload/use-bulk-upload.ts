import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface BulkUploadRequest {
  excelData: string; // Base64 encoded Excel file
  type: "students" | "programs" | "scholarships" | "funds";
  batchSize?: number;
}

export const useBulkUpload = () => {
  return useMutation({
    mutationFn: async (data: BulkUploadRequest) => {
      const response = await fetch("/api/bulk-upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to process bulk upload");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.results.failed > 0) {
        toast.warning(`Upload completed with ${data.results.failed} errors. Check the results for details.`);
      } else {
        toast.success(`Successfully uploaded ${data.results.success} records`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to process bulk upload");
    },
  });
};
