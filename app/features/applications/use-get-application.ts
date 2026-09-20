import { useQuery } from "@tanstack/react-query";

export const useGetApplication = (id: string) => {
  return useQuery({
    queryKey: ["application", id],
    queryFn: async () => {
      const response = await fetch(`/api/applications/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch application");
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 30000,
  });
};
