import { useQuery } from "@tanstack/react-query";

export const useGetDisbursements = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  awardId?: string;
  method?: string;
}) => {
  return useQuery({
    queryKey: ["disbursements", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.search) queryParams.set("search", params.search);
      if (params?.status) queryParams.set("status", params.status);
      if (params?.awardId) queryParams.set("awardId", params.awardId);
      if (params?.method) queryParams.set("method", params.method);

      const response = await fetch(`/api/disbursements?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch disbursements");
      }

      return response.json();
    },
    staleTime: 30000,
  });
};
