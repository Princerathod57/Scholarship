import { useQuery } from "@tanstack/react-query";

export const useGetInstitutionalBankAccounts = () => {
  return useQuery({
    queryKey: ["institutional-bank-accounts"],
    queryFn: async () => {
      const response = await fetch("/api/bank/institutional");
      
      if (!response.ok) {
        throw new Error("Failed to fetch institutional bank accounts");
      }
      
      return response.json();
    },
  });
};
