import { queryOptions } from "@tanstack/react-query";
import { api, createKey } from "@/lib/api";

export const userQuery = (authKey?: string | null) => {
  const query = {
    all: ["user"],

    me: () =>
      queryOptions({
        queryKey: createKey(...query.all, "me"),
        queryFn: async () => {
          const res = await api("auth/me", { method: "GET" });
          return res.json();
        },
      }),

    profile: () =>
      queryOptions({
        queryKey: createKey(...query.all, "profile", authKey),
        queryFn: async () => {
          const res = await api("user/profile", { method: "GET" });
          return res.json();
        },
        enabled: !!authKey,
      }),
  };

  return query;
};
