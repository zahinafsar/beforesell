import { queryOptions } from "@tanstack/react-query";
import { api, createKey } from "@/lib/api";

interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface AdminListingsParams {
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
  search?: string;
  userId?: string;
}

function toQuery(params?: Record<string, unknown>) {
  if (!params) return {};
  const q: Record<string, string> = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") q[k] = String(v);
  });
  return q;
}

export const adminQuery = (authKey?: string | null) => {
  const query = {
    all: ["admin"],

    stats: () =>
      queryOptions({
        queryKey: createKey(...query.all, "stats", authKey),
        queryFn: async () => {
          const res = await api("admin/stats", { method: "GET" });
          return res.json();
        },
        enabled: !!authKey,
      }),

    users: (params?: AdminUsersParams) =>
      queryOptions({
        queryKey: createKey(...query.all, "users", params, authKey),
        queryFn: async () => {
          const res = await api("admin/users", {
            method: "GET",
            query: toQuery(params as Record<string, unknown>),
          });
          return res.json();
        },
        enabled: !!authKey,
      }),

    userById: (id: string) =>
      queryOptions({
        queryKey: createKey(...query.all, "user", id, authKey),
        queryFn: async () => {
          const res = await api("admin/users/[id]", {
            method: "GET",
            params: { id },
          });
          return res.json();
        },
        enabled: !!authKey && !!id,
      }),

    listings: (params?: AdminListingsParams) =>
      queryOptions({
        queryKey: createKey(...query.all, "listings", params, authKey),
        queryFn: async () => {
          const res = await api("admin/listings", {
            method: "GET",
            query: toQuery(params as Record<string, unknown>),
          });
          return res.json();
        },
        enabled: !!authKey,
      }),

    categories: () =>
      queryOptions({
        queryKey: createKey(...query.all, "categories", authKey),
        queryFn: async () => {
          const res = await api("admin/categories", { method: "GET" });
          return res.json();
        },
        enabled: !!authKey,
      }),

    categoryAttributes: (categoryId: string) =>
      queryOptions({
        queryKey: createKey(...query.all, "attributes", categoryId, authKey),
        queryFn: async () => {
          const res = await api("admin/categories/[id]/attributes", {
            method: "GET",
            params: { id: categoryId },
          });
          return res.json();
        },
        enabled: !!authKey && !!categoryId,
      }),
  };

  return query;
};
