import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateStudentRequest {
  name?: string;
  email?: string;
  studentId?: string;
  programId?: string;
  gpa?: number;
  enrollmentDate?: string;
  graduationDate?: string;
  phone?: string;
  address?: string;
}

export const useUpdateStudent = (id: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateStudentRequest) => {
      const response = await fetch(`/api/students/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Failed to update student");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Student updated successfully");
      queryClient.invalidateQueries({ queryKey: ["student", id] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update student");
    },
  });
};
