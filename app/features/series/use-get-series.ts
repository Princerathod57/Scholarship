import { useQuery } from "@tanstack/react-query";

export const useGetSeries = () => {
  return useQuery({
    queryKey: ["series"],
    queryFn: async () => {
      const response = await fetch("/api/series");
      
      if (!response.ok) {
        throw new Error("Failed to fetch series");
      }
      
      return response.json();
    },
  });
};
