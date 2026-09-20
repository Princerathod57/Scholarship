import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  role: string;
  printName?: string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  permissions?: string[];
  // Student-specific fields
  studentId?: string;
  programId?: string;
  gpa?: number;
  enrollmentDate?: string;
  graduationDate?: string;
  // Faculty-specific fields
  facultyId?: string;
  department?: string;
  position?: string;
  hireDate?: string;
}

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create user");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-statistics"] });
      toast.success("User created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
