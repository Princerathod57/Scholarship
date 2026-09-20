import { useQuery } from "@tanstack/react-query";

export const useGetApplicationDocuments = (applicationId: string, enabled = true) => {
  return useQuery({
    queryKey: ["application-documents", applicationId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/application/${applicationId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch application documents");
      }
      
      return response.json();
    },
    enabled: enabled && !!applicationId,
  });
};
