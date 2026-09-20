import { useQuery } from "@tanstack/react-query";

export const useGetDocument = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["document", id],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch document");
      }
      
      return response.json();
    },
    enabled: enabled && !!id,
  });
};
