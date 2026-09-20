import { useQuery } from "@tanstack/react-query";

export const useGetUserStatistics = () => {
  return useQuery({
    queryKey: ["user-statistics"],
    queryFn: async () => {
      const response = await fetch("/api/users/statistics");
      
      if (!response.ok) {
        throw new Error("Failed to fetch user statistics");
      }
      
      return response.json();
    },
  });
};
