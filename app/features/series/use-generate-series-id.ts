import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGenerateSeriesId = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/series/${id}/generate`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate series ID");
      }

      return response.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["series"] });
      queryClient.invalidateQueries({ queryKey: ["series", variables] });
      toast.success("ID generated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
