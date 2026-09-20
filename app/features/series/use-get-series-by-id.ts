import { useQuery } from "@tanstack/react-query";

export const useGetSeriesById = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["series", id],
    queryFn: async () => {
      const response = await fetch(`/api/series/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch series");
      }
      
      return response.json();
    },
    enabled: enabled && !!id,
  });
};
