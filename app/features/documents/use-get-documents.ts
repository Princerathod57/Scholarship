import { useQuery } from "@tanstack/react-query";

interface GetDocumentsParams {
  applicationId?: string;
  disbursementId?: string;
  uploadedBy?: string;
  page?: number;
  limit?: number;
}

export const useGetDocuments = (params: GetDocumentsParams = {}) => {
  return useQuery({
    queryKey: ["documents", params],
    queryFn: async () => {
      const url = new URL("/api/documents", window.location.origin);
      
      if (params.applicationId) url.searchParams.set("applicationId", params.applicationId);
      if (params.disbursementId) url.searchParams.set("disbursementId", params.disbursementId);
      if (params.uploadedBy) url.searchParams.set("uploadedBy", params.uploadedBy);
      if (params.page) url.searchParams.set("page", params.page.toString());
      if (params.limit) url.searchParams.set("limit", params.limit.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch documents");
      }
      
      return response.json();
    },
  });
};
