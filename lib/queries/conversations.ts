import { queryOptions } from "@tanstack/react-query";
import { api, createKey } from "@/lib/api";

export const conversationsQuery = (authKey?: string | null) => {
  const query = {
    all: ["conversations"],

    list: () =>
      queryOptions({
        queryKey: createKey(...query.all, "list", authKey),
        queryFn: async () => {
          const res = await api("conversations", { method: "GET" });
          return res.json();
        },
        enabled: !!authKey,
        refetchInterval: 5000,
      }),

    byId: (props: { id: string }) =>
      queryOptions({
        queryKey: createKey(...query.all, "byId", props, authKey),
        queryFn: async () => {
          const res = await api("conversations/[id]", {
            method: "GET",
            params: { id: props.id },
          });
          return res.json();
        },
        enabled: !!authKey && !!props.id,
        refetchInterval: 3000,
      }),

    unreadCount: () =>
      queryOptions({
        queryKey: createKey(...query.all, "unreadCount", authKey),
        queryFn: async () => {
          const res = await api("conversations/unread", { method: "GET" });
          return res.json();
        },
        enabled: !!authKey,
        refetchInterval: 10000,
      }),
  };

  return query;
};
