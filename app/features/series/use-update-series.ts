import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateSeriesData {
  name?: string;
  prefix?: string;
  description?: string;
  isDefault?: boolean;
  format?: string;
  lastNumber?: number;
}

export const useUpdateSeries = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateSeriesData }) => {
      const response = await fetch(`/api/series/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update series");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["series"] });
      queryClient.invalidateQueries({ queryKey: ["series", variables.id] });
      toast.success("Series updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
