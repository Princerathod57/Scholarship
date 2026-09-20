import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ChangePasswordRequest {
  userId: string;
  newPassword: string;
}

interface ChangePasswordResponse {
  message: string;
  success: boolean;
}

export const useChangePassword = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ChangePasswordResponse, Error, ChangePasswordRequest>({
    mutationFn: async (data) => {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Failed to change password");
      }

      return await response.json();
    },
    onSuccess: (data) => {
      toast.success("Password changed successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  return mutation;
};
