import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface ChangePasswordData {
  userId: string;
  newPassword: string;
}

export const useChangeUserPassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ChangePasswordData }) => {
      const response = await fetch(`/api/users/${id}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to change password");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
