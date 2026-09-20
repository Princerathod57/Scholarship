import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type UpdateRecommendationData = {
  title?: string;
  content?: string;
  status?: "DRAFT" | "SUBMITTED";
};

export const useUpdateRecommendation = (id: string) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: UpdateRecommendationData) => {
      const response = await client.api.recommendations[":id"].$patch({
        param: { id },
        json: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData as any).error || "Failed to update recommendation");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.data.status === "SUBMITTED") {
        toast.success("Recommendation submitted successfully!");
      } else {
        toast.success("Recommendation updated successfully!");
      }
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["recommendation", id] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update recommendation");
    },
  });

  return mutation;
};

export const useDeleteRecommendation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await client.api.recommendations[":id"].$delete({
        param: { id },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData as any).error || "Failed to delete recommendation");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Recommendation deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete recommendation");
    },
  });

  return mutation;
};
