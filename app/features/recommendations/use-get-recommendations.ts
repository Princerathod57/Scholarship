import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/hono";

export const useGetRecommendations = () => {
  const query = useQuery({
    queryKey: ["recommendations"],
    queryFn: async () => {
      const response = await client.api.recommendations.$get();
      
      if (!response.ok) {
        throw new Error("Failed to fetch recommendations");
      }
      
      return response.json();
    },
  });

  return query;
};

export const useGetRecommendation = (id?: string) => {
  const query = useQuery({
    queryKey: ["recommendation", id],
    queryFn: async () => {
      if (!id) throw new Error("Recommendation ID is required");
      
      const response = await client.api.recommendations[":id"].$get({
        param: { id }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch recommendation");
      }
      
      return response.json();
    },
    enabled: !!id,
  });

  return query;
};
