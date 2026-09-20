import { useQuery } from "@tanstack/react-query";

export const useGetPublicScholarships = () => {
  return useQuery({
    queryKey: ["public-scholarships"],
    queryFn: async () => {
      const response = await fetch("/api/scholarships/public");

      if (!response.ok) {
        throw new Error("Failed to fetch public scholarships");
      }

      return response.json();
    },
    staleTime: 60000, // 1 minute
  });
};
