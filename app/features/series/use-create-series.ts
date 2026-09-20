import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface CreateSeriesData {
  name: string;
  prefix: string;
  description?: string;
  isDefault?: boolean;
  format?: string;
}

export const useCreateSeries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateSeriesData) => {
      const response = await fetch("/api/series", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create series");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["series"] });
      toast.success("Series created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
