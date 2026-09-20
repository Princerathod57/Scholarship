import { useQuery } from "@tanstack/react-query";

export const useGetStudentFinancialSummary = (id: string) => {
  return useQuery({
    queryKey: ["student-financial-summary", id],
    queryFn: async () => {
      const response = await fetch(`/api/students/${id}/financial-summary`);

      if (!response.ok) {
        throw new Error("Failed to fetch financial summary");
      }

      return response.json();
    },
    enabled: !!id,
    staleTime: 30000,
  });
};
