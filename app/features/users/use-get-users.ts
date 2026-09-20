import { useQuery } from "@tanstack/react-query";

interface GetUsersParams {
  role?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const useGetUsers = (params: GetUsersParams = {}) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: async () => {
      const url = new URL("/api/users", window.location.origin);
      
      if (params.role) url.searchParams.set("role", params.role);
      if (params.search) url.searchParams.set("search", params.search);
      if (params.page) url.searchParams.set("page", params.page.toString());
      if (params.limit) url.searchParams.set("limit", params.limit.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      return response.json();
    },
  });
};
