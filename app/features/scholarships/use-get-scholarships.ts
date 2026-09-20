import { useQuery } from "@tanstack/react-query";

export const useGetScholarships = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  programId?: string;
}) => {
  return useQuery({
    queryKey: ["scholarships", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.search) queryParams.set("search", params.search);
      if (params?.category) queryParams.set("category", params.category);
      if (params?.status) queryParams.set("status", params.status);
      if (params?.programId) queryParams.set("programId", params.programId);

      const response = await fetch(`/api/scholarships?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch scholarships");
      }

      return response.json();
    },
    staleTime: 30000,
  });
};
