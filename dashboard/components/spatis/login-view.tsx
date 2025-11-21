"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type AdminLoginPayload } from "@/lib/api/auth";
import { setAuthToken } from "@/lib/auth/token-storage";
import {
  adminLoginSchema,
  type AdminLoginFormValues,
} from "@/lib/validations/admin";

type LoginViewProps = {
  onAuthenticated: (token: string) => void;
};

export const LoginView = ({ onAuthenticated }: LoginViewProps) => {
  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: "", password: "" },
  });
  const { errors } = form.formState;
  const loginMutation = useMutation({
    mutationFn: (values: AdminLoginPayload) => login(values),
    onSuccess: (data) => {
      setAuthToken(data.token);
      onAuthenticated(data.token);
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Use your admin credentials to manage Spätis.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) => {
              const payload = adminLoginSchema.parse(values);
              loginMutation.mutate(payload);
            })}
          >
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                {...form.register("email")}
              />
              {errors.email?.message ? (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                {...form.register("password")}
              />
              {errors.password?.message ? (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
            {loginMutation.isError ? (
              <p className="text-sm text-destructive">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : "Unable to sign in. Please try again."}
              </p>
            ) : null}
            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
