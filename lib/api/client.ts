import { createNextFetchApi } from "next-ts-api";
import { type ApiRoutes } from "@/types/api";

export const api = createNextFetchApi<ApiRoutes>();
