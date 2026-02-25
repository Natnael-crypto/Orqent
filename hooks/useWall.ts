// // hooks/useWall.ts
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import {
//   createWall,
//   fetchWallById,
//   fetchWallPublicById,
//   fetchWalls,
// } from "@/services/WidgetService";
// import { api } from "@/lib/api";

// // TODO: Move these to proper types files
// interface CreateRequest {
//   name: string;
//   description?: string;
// }

// interface CreateWallResponse {
//   id: string;
//   name: string;
//   description?: string;
//   created_at: string;
// }

// interface Wall {
//   id: string;
//   name: string;
//   description?: string;
//   created_at: string;
//   updated_at: string;
// }

// export const useCreateWall = () => {
//   const queryClient = useQueryClient();

//   return useMutation<CreateWallResponse, Error, CreateRequest>({
//     mutationFn: createWall,
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["walls"] });
//     },
//   });
// };

// export function useWalls() {
//   return useQuery<Wall[], Error>({
//     queryKey: ["walls"],
//     queryFn: fetchWalls,
//     staleTime: 1000 * 60 * 2,
//     retry: 1,
//   });
// }

// export function useWallById(id?: string) {
//   return useQuery<Wall, Error>({
//     queryKey: ["wall", id],
//     queryFn: () => fetchWallById(id!),
//     enabled: !!id,
//     staleTime: 1000 * 60 * 5,
//     retry: 1,
//   });
// }

// export function useWallPublicById(id?: string) {
//   return useQuery<Wall, Error>({
//     queryKey: ["wall", id],
//     queryFn: () => fetchWallPublicById(id!),
//     enabled: !!id,
//     staleTime: 1000 * 60 * 5,
//     retry: 1,
//   });
// }
