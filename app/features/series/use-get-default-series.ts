import { useQuery } from "@tanstack/react-query";

export const useGetDefaultSeries = (type: string, enabled = true) => {
  return useQuery({
    queryKey: ["default-series", type],
    queryFn: async () => {
      const response = await fetch(`/api/series/default/${type}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch default series");
      }
      
      return response.json();
    },
    enabled: enabled && !!type,
  });
};
