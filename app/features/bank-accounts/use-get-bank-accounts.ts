import { useQuery } from "@tanstack/react-query";

interface GetBankAccountsParams {
  studentId?: string;
  isInstitutional?: boolean;
  isActive?: boolean;
}

export const useGetBankAccounts = (params: GetBankAccountsParams = {}) => {
  return useQuery({
    queryKey: ["bank-accounts", params],
    queryFn: async () => {
      const url = new URL("/api/bank", window.location.origin);
      
      if (params.studentId) url.searchParams.set("studentId", params.studentId);
      if (params.isInstitutional !== undefined) url.searchParams.set("isInstitutional", params.isInstitutional.toString());
      if (params.isActive !== undefined) url.searchParams.set("isActive", params.isActive.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error("Failed to fetch bank accounts");
      }
      
      return response.json();
    },
  });
};
