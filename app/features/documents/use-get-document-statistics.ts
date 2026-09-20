import { useQuery } from "@tanstack/react-query";

export const useGetDocumentStatistics = () => {
  return useQuery({
    queryKey: ["document-statistics"],
    queryFn: async () => {
      const response = await fetch("/api/documents/statistics");
      
      if (!response.ok) {
        throw new Error("Failed to fetch document statistics");
      }
      
      return response.json();
    },
  });
};
