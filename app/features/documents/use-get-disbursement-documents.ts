import { useQuery } from "@tanstack/react-query";

export const useGetDisbursementDocuments = (disbursementId: string, enabled = true) => {
  return useQuery({
    queryKey: ["disbursement-documents", disbursementId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/disbursement/${disbursementId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch disbursement documents");
      }
      
      return response.json();
    },
    enabled: enabled && !!disbursementId,
  });
};
