import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth"; // ✅ Ensure correct path
import { useCreateAuditLog } from "../auditlog/use-create-auditlog"; // ✅ Adjust path if needed

// Request type matching your createUserSchema
type CreateEmployeeInput = {
  name: string;
  email: string;
  password?: string; // Now optional
  role: "ADMIN" | "FINANCIAL_AID_OFFICER" | "STUDENT" | "FACULTY";
  printName: string;
  position: string;
  phone: string;
  whatsapp: string;
  address: string;
  senderId: string;
  panNumber?: string;
  aadhaarNumber?: string;
  permissions: string[];
};

// Response type from backend
type CreateEmployeeResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string | null;
    printName: string | null;
    senderId: string | null;
    position: string | null;
    phone: string | null;
    whatsapp: string | null;
    address: string | null;
    panNumber: string | null;
    aadhaarNumber: string | null;
  };
  generatedPassword?: string;
};

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const createAuditLog = useCreateAuditLog();

  return useMutation<CreateEmployeeResponse, Error, CreateEmployeeInput>({
    // @ts-ignore
    mutationFn: async (data) => {
      // If you receive role in lowercase from the UI, map it to uppercase here
      const mappedData = {
        ...data,
        role: data.role.toUpperCase() as "ADMIN" | "FINANCIAL_AID_OFFICER" | "STUDENT" | "FACULTY",
      };
      const response = await client.api.users.$post({ json: mappedData });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error('error' in errorData ? errorData.error as string : "Failed to create employee");
      }

      const result = await response.json();
      // Transform the API response to match CreateEmployeeResponse
      return {
        message: result.message,
        user: result.data,
        generatedPassword: result.generatedPassword,
      };
    },    onSuccess: (data) => {
      toast.success("Employee created successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });

      // ✅ Create audit log
      if (user?.id) {
        createAuditLog.mutate({
          userId: user.id,
          action: "CREATE",
          entityType: "USER",
          entityId: data.user.id,
          details: data,
        });
      } else {
        console.warn("❌ Cannot create audit log — userId is missing");
      }
      
      // Refresh the page to ensure all data is up-to-date
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.reload();
        }
      }, 1000);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create employee");
    },
  });
}
