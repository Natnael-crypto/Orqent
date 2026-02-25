import { getAuthenticatedUser, userService } from "@/hooks/services/user";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/types/common";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getAuthenticatedUser,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}

export const useUserActions = () => {
  const updateProfile = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: () => toast.success("Profile updated successfully"),
    onError: (err: unknown) =>
      toast.error((err as ApiError)?.response?.data?.error || "Update failed"),
  });

  const changePassword = useMutation({
    mutationFn: userService.changePassword,
    onSuccess: () => toast.success("Password updated successfully"),
    onError: (err: unknown) =>
      toast.error((err as ApiError)?.response?.data?.error || "Password change failed"),
  });

  const deleteAccount = useMutation({
    mutationFn: userService.deleteAccount,
    onSuccess: () => {
      toast.success("Account deleted");
      window.location.href = "/login";
    },
    onError: (err: unknown) =>
      toast.error((err as ApiError)?.response?.data?.error || "Account deletion failed"),
  });

  return { updateProfile, changePassword, deleteAccount };
};
