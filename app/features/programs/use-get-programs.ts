import { useQuery } from "@tanstack/react-query";

export const useGetPrograms = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  return useQuery({
    queryKey: ["programs", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.search) queryParams.set("search", params.search);
      if (params?.status) queryParams.set("status", params.status);

      const response = await fetch(`/api/programs?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch programs");
      }

      return response.json();
    },
    staleTime: 30000,
  });
};
