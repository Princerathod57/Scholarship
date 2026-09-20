import { useQuery } from "@tanstack/react-query";

export const useGetUser = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async () => {
      const response = await fetch(`/api/users/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      
      return response.json();
    },
    enabled: enabled && !!id,
  });
};
