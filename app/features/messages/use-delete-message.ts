import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (messageId: string) => {
      console.log("Deleting message:", messageId);
      
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });

      console.log("Delete message response status:", response.status);

      const responseData = await response.json();
      console.log("Delete message response data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to delete message");
      }

      return responseData;
    },
    onSuccess: () => {
      // Invalidate and refetch messages to update the UI
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      console.log("Message deleted successfully, invalidating queries");
    },
    onError: (error) => {
      console.error("Error deleting message:", error);
    },
  });
};
