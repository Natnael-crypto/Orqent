import { useMutation } from "@tanstack/react-query";
import { loginUser, registerUser } from "@/hooks/services/authService";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { ApiError } from "@/types/common";

export function useRegisterUser() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Registration successful! Redirecting...",
      });
      router.push("/dashboard");
    },
    onError: (err: unknown) => {
      const errorMessage = (err as ApiError).response?.data?.error || (err as Error).message || "Registration failed";
      toast({
        title: "Registration Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}

export function useLoginUser() {
  const router = useRouter();
  const { toast } = useToast();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: () => {
      toast({
        title: "Welcome back!",
        description: "Login successful! Redirecting...",
      });
      router.push("/dashboard");
    },
    onError: (err: unknown) => {
      const errorMessage = (err as ApiError).response?.data?.error || (err as Error).message || "Login failed";
      toast({
        title: "Login Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });
}
