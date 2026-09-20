import { useQuery } from "@tanstack/react-query";

export const useGetScholarship = (id: string) => {
  return useQuery({
    queryKey: ["scholarship", id],
    queryFn: async () => {
      const response = await fetch(`/api/scholarships/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch scholarship");
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 30000,
  });
};
