import { useQuery } from "@tanstack/react-query";

export const useGetAward = (id: string) => {
  return useQuery({
    queryKey: ["award", id],
    queryFn: async () => {
      const response = await fetch(`/api/awards/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch award");
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 30000,
  });
};
