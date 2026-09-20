import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

interface SendMessageRequest {
  recipientId: string;
  subject: string;
  content: string;
  type?: "GENERAL" | "SCHOLARSHIP_UPDATE" | "APPLICATION_UPDATE";
}

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: SendMessageRequest) => {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate all message queries to refresh notifications
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      
      // Also specifically invalidate queries for the recipient
      if (data?.data?.recipientId) {
        queryClient.invalidateQueries({ queryKey: ["messages", data.data.recipientId] });
      }
      
      toast.success("Message sent successfully!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send message");
    },
  });
};
