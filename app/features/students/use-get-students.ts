import { useQuery } from "@tanstack/react-query";

export const useGetStudents = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  programId?: string;
}) => {
  return useQuery({
    queryKey: ["students", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.search) queryParams.set("search", params.search);
      if (params?.programId) queryParams.set("programId", params.programId);

      const response = await fetch(`/api/students?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      return response.json();
    },
    staleTime: 30000, // 30 seconds
  });
};
