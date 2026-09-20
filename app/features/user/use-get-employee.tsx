import { InferResponseType } from "hono";
import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/hono";

export type UsersResponse = InferResponseType<typeof client.api.users["$get"], 200>;

export const useGetUsers = () => {
  const query = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await client.api.users.$get({});

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const { data } = await response.json();
       
      return data; // 👈 Return the correct property from the JSON response
    },
  });

  return query;
};
