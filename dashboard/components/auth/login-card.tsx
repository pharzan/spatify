"use client";

import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminLoginPayload } from "@/lib/api/auth";
import { useAuth } from "@/components/auth/auth-context";

export const LoginCard = () => {
  const { login, isLoggingIn, loginError } = useAuth();
  const form = useForm<AdminLoginPayload>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    await login(values);
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4 py-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle>Admin access</CardTitle>
          <CardDescription>Sign in to manage Späti locations and amenities.</CardDescription>
        </CardHeader>
        <CardContent>
          {loginError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Login failed</AlertTitle>
              <AlertDescription>{loginError.message}</AlertDescription>
            </Alert>
          ) : null}
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...form.register("email", { required: "Email is required" })}
              />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                {...form.register("password", { required: "Password is required" })}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="w-full" disabled={isLoggingIn}>
              {isLoggingIn ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
