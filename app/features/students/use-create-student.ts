import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateStudentRequest {
  name: string;
  email: string;
  studentId: string;
  programId?: string;
  gpa?: number;
  enrollmentDate?: string;
  graduationDate?: string;
  phone?: string;
  address?: string;
}

export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStudentRequest) => {
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to create student");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success("Student created successfully");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      
      // Optional: Show temporary password if provided
      if (data.tempPassword) {
        toast.info(`Temporary password: ${data.tempPassword}`, { duration: 10000 });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create student");
    },
  });
};
