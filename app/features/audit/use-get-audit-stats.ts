import { useQuery } from "@tanstack/react-query";

export const useGetAuditStats = (params?: {
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ["audit-stats", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.startDate) queryParams.set("startDate", params.startDate);
      if (params?.endDate) queryParams.set("endDate", params.endDate);

      const response = await fetch(`/api/auditlog/stats?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch audit statistics");
      }

      return response.json();
    },
    staleTime: 60000, // 1 minute
  });
};
