import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@repo/ui";
import { loginInputSchema, type LoginInput } from "@repo/schemas";
import { RHFInput } from "@/components/fields/rhf-input";
import { login } from "../services";
import { setToken } from "@/lib/api/token";
import { safeRedirect } from "@/lib/utils/safe-redirect";
import { sessionQueryKey } from "../use-session";

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo }: LoginFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { control, handleSubmit } = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema) as Resolver<LoginInput>,
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token }) => {
      setToken(token);
      queryClient.invalidateQueries({ queryKey: sessionQueryKey });
      router.history.push(safeRedirect(redirectTo) ?? "/");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: LoginInput) => {
    mutation.mutate(data);
  };

  const onInvalid = (errors: FieldErrors<LoginInput>) => {
    const messages = Object.values(errors)
      .map((e) => e?.message)
      .filter(Boolean) as string[];
    toast.error("Couldn't sign in", {
      description:
        messages.length > 0
          ? messages.map((m) => `• ${m}`).join("  ")
          : "Please fill in your email and password.",
      duration: 4000,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-5"
      noValidate
    >
      <RHFInput
        name="email"
        control={control}
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
      />
      <RHFInput
        name="password"
        control={control}
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
      />
      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full rounded-lg bg-[#cc97ff] text-[#10131a] hover:bg-[#cc97ff]/90 font-bold"
      >
        {mutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
