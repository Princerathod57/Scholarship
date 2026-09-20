import { useQuery } from "@tanstack/react-query";

export const useGetBankAccount = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["bank-account", id],
    queryFn: async () => {
      const response = await fetch(`/api/bank/${id}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch bank account");
      }
      
      return response.json();
    },
    enabled: enabled && !!id,
  });
};
