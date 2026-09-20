import { useQuery } from "@tanstack/react-query";

export const useGetMessages = (userId?: string, unreadOnly?: boolean) => {
  return useQuery({
    queryKey: ["messages", userId, unreadOnly],
    queryFn: async () => {
      // If we're looking for unread messages only and have a specific user ID,
      // use the recipient-specific endpoint for better performance
      if (unreadOnly && userId) {
        console.log("Fetching unread messages for recipient:", userId);
        
        const response = await fetch(`/api/messages/recipient/${userId}`);
        console.log("Recipient messages response status:", response.status);
        
        const responseData = await response.json();
        console.log("Recipient messages response data:", responseData);
        
        if (!response.ok) {
          throw new Error(responseData.error || "Failed to fetch recipient messages");
        }
        
        return responseData;
      }
      
      // Otherwise use the general messages endpoint
      const params = new URLSearchParams();
      if (userId) params.append("userId", userId);
      if (unreadOnly) params.append("unreadOnly", "true");
      
      console.log("Fetching messages with params:", params.toString());
      
      const response = await fetch(`/api/messages?${params.toString()}`);
      
      console.log("Messages response status:", response.status);
      
      const responseData = await response.json();
      console.log("Messages response data:", responseData);
      
      if (!response.ok) {
        throw new Error(responseData.error || "Failed to fetch messages");
      }
      
      return responseData;
    },
    // Retry on error but don't spam the console
    retry: 1,
    // Cache for 30 seconds to show new messages faster
    staleTime: 30 * 1000,
    // Refetch every 30 seconds when component is focused
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
  });
};
