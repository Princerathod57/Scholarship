import { useQuery } from "@tanstack/react-query";

export const useGetAwards = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  studentId?: string;
  scholarshipId?: string;
}) => {
  return useQuery({
    queryKey: ["awards", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.search) queryParams.set("search", params.search);
      if (params?.status) queryParams.set("status", params.status);
      if (params?.studentId) queryParams.set("studentId", params.studentId);
      if (params?.scholarshipId) queryParams.set("scholarshipId", params.scholarshipId);

      const response = await fetch(`/api/awards?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch awards");
      }

      return response.json();
    },
    staleTime: 30000,
  });
};
