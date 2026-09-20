import { useQuery } from "@tanstack/react-query";

export const useGetAuditLogs = (params?: {
  page?: number;
  limit?: number;
  userId?: string;
  entityType?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
}) => {
  return useQuery({
    queryKey: ["audit-logs", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.set("page", params.page.toString());
      if (params?.limit) queryParams.set("limit", params.limit.toString());
      if (params?.userId) queryParams.set("userId", params.userId);
      if (params?.entityType) queryParams.set("entityType", params.entityType);
      if (params?.action) queryParams.set("action", params.action);
      if (params?.startDate) queryParams.set("startDate", params.startDate);
      if (params?.endDate) queryParams.set("endDate", params.endDate);

      const response = await fetch(`/api/auditlog?${queryParams}`);

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      return response.json();
    },
    staleTime: 30000,
  });
};
