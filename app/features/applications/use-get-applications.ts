import { useQuery } from "@tanstack/react-query";

export const useGetApplications = (params?: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  scholarshipId?: string;
  studentId?: string;
}) => {
  return useQuery({
    queryKey: ["applications", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.search) queryParams.set("search", params.search);
      if (params?.status) queryParams.set("status", params.status);
      if (params?.scholarshipId) queryParams.set("scholarshipId", params.scholarshipId);
      if (params?.studentId) queryParams.set("studentId", params.studentId);

      const response = await fetch(`/api/applications?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      return response.json();
    },
    staleTime: 30000,
  });
};
