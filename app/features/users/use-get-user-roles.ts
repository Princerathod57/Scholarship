import { useQuery } from "@tanstack/react-query";

export const useGetUserRoles = () => {
  return useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const response = await fetch("/api/users/roles");
      
      if (!response.ok) {
        throw new Error("Failed to fetch user roles");
      }
      
      return response.json();
    },
  });
};
