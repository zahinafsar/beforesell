import { queryOptions } from "@tanstack/react-query";
import { api, createKey } from "@/lib/api";

interface ListingsQueryParams {
  page?: number;
  limit?: number;
  userId?: string;
  categoryId?: string;
  locationId?: string;
  status?: string;
  search?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  featured?: string;
}

interface ListingsResponse {
  listings: {
    id: string;
    title: string;
    slug: string;
    price: number;
    negotiable: boolean;
    status: string;
    views: number;
    createdAt: Date;
    images: { url: string }[];
    location: { address: string };
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

async function fetchListings(params?: ListingsQueryParams): Promise<ListingsResponse> {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.set(key, String(value));
      }
    });
  }
  const query = searchParams.toString();
  const res = await api(`listings${query ? `?${query}` : ""}` as "listings", { method: "GET" });
  return res.json();
}

export const listingsQuery = (authKey?: string | null) => {
  const query = {
    all: ["listings"],

    list: (params?: ListingsQueryParams) =>
      queryOptions({
        queryKey: createKey(...query.all, "list", params),
        queryFn: async () => {
          const queryParams: Record<string, string> = {};
          if (params) {
            Object.entries(params).forEach(([key, value]) => {
              if (value !== undefined && value !== null && value !== "") {
                queryParams[key] = String(value);
              }
            });
          }
          const res = await api("listings", { method: "GET", query: queryParams });
          return res.json();
        },
      }),

    byId: (props: { id: string }) =>
      queryOptions({
        queryKey: createKey(...query.all, "byId", props),
        queryFn: async () => {
          const res = await api("listings/[id]", {
            method: "GET",
            params: { id: props.id },
          });
          return res.json();
        },
        enabled: !!props.id,
      }),

    userListings: (props?: { userId?: string }) =>
      queryOptions({
        queryKey: createKey(...query.all, "userListings", props, authKey),
        queryFn: () => fetchListings(props?.userId ? { userId: props.userId } : undefined),
        enabled: !!authKey,
      }),

    favorites: () =>
      queryOptions({
        queryKey: createKey(...query.all, "favorites", authKey),
        queryFn: async () => {
          const res = await api("user/favorites", { method: "GET" });
          return res.json();
        },
        enabled: !!authKey,
      }),
  };

  return query;
};
