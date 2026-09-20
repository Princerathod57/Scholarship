import { useQuery } from "@tanstack/react-query";

export const useGetFunds = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  programId?: string;
}) => {
  return useQuery({
    queryKey: ["funds", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.search) queryParams.set("search", params.search);
      if (params?.programId) queryParams.set("programId", params.programId);

      const response = await fetch(`/api/funds?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch funds");
      }

      return response.json();
    },
    staleTime: 30000,
  });
};
