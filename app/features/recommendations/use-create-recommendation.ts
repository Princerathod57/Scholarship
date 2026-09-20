import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/hono";
import { toast } from "sonner";

type CreateRecommendationData = {
  facultyId: string;
  studentId: string;
  applicationId?: string;
  scholarshipId?: string;
  title: string;
  content: string;
  status?: "DRAFT" | "SUBMITTED";
};

export const useCreateRecommendation = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateRecommendationData) => {
      const response = await client.api.recommendations.$post({
        json: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error((errorData as any).error || "Failed to create recommendation");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Recommendation created successfully!");
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create recommendation");
    },
  });

  return mutation;
};
