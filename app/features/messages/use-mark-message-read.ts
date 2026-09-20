import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useMarkMessageRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: "PATCH",
      });
      
      if (!response.ok) {
        throw new Error("Failed to mark message as read");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to mark message as read");
    },
  });
};
