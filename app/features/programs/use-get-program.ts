import { useQuery } from "@tanstack/react-query";

export const useGetProgram = (id: string) => {
  return useQuery({
    queryKey: ["program", id],
    queryFn: async () => {
      const response = await fetch(`/api/programs/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch program");
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 30000,
  });
};
