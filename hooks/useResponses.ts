"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

// TODO: Move these to proper types files
interface Response {
  id: string;
  wall_id: string;
  content: string;
  sentiment?: "positive" | "neutral" | "negative";
  created_at: string;
}

interface CreateResponseRequest {
  wall_id: string;
  content: string;
  sentiment?: "positive" | "neutral" | "negative";
}

interface CreateResponse {
  id: string;
  wall_id: string;
  content: string;
  sentiment?: "positive" | "neutral" | "negative";
  created_at: string;
}

interface FetchResponsesParams {
  wall_id?: string;
  sentiment?: "positive" | "neutral" | "negative" | "all";
  search?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResponse {
  data: Response[];
  total: number;
}

async function fetchResponses(
  params: FetchResponsesParams
): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams();

  if (params.wall_id) searchParams.append("wall_id", params.wall_id);
  if (params.sentiment) searchParams.append("sentiment", params.sentiment);
  if (params.search) searchParams.append("search", params.search);
  if (params.page) searchParams.append("page", String(params.page));
  if (params.limit) searchParams.append("limit", String(params.limit));

  const response = await api.get<PaginatedResponse>(
    `/responses/all?${searchParams.toString()}`
  );
  return response.data;
}

export function useResponses(params: FetchResponsesParams) {
  return useQuery({
    queryKey: ["responses", params],
    queryFn: () => fetchResponses(params),
    staleTime: 60_000,
  });
}

export const createResponse = async (
  wall: CreateResponseRequest
): Promise<CreateResponse> => {
  const res = await api.post<CreateResponse>("/responses", wall);
  return res.data;
};

export const useCreateResponse = () => {
  return useMutation<CreateResponse, Error, CreateResponseRequest>({
    mutationFn: createResponse,
  });
};
