"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { Flame, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

type AuthStep = "signIn" | "signUp" | { email: string };

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [step, setStep] = useState<AuthStep>("signIn");
  const [isLoading, setIsLoading] = useState(false);

  const isSignInFlow = step === "signIn";
  const isSignUpFlow = step === "signUp";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      if (isSignInFlow || isSignUpFlow) {
        await signIn("password", formData);
        const email = formData.get("email") as string;
        setStep({ email });
      } else {
        await signIn("password", formData);
        router.replace("/home");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const AuthForm = () => {
    if (typeof step === "string") {
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="pl-10"
                autoComplete="email"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="pl-10"
                autoComplete={
                  isSignUpFlow ? "new-password" : "current-password"
                }
              />
            </div>
            {isSignInFlow && (
              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}
          </div>

          <input type="hidden" name="flow" value={step} />

          {/* Submit & Toggle */}
          <div className="space-y-2 pt-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </span>
              ) : isSignInFlow ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setStep(isSignInFlow ? "signUp" : "signIn")}
            >
              {isSignInFlow ? "Create a new account" : "Back to sign in"}
            </Button>
          </div>
        </form>
      );
    }

    // Email verification
    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">
            Verification Code
          </label>
          <Input
            id="code"
            name="code"
            type="text"
            placeholder="123456"
            required
          />
        </div>

        <input type="hidden" name="flow" value="email-verification" />
        <input type="hidden" name="email" value={step.email} />

        <div className="space-y-2 pt-2">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Verifying...
              </span>
            ) : (
              "Verify"
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={() => setStep("signIn")}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  const titleText =
    typeof step === "string"
      ? step === "signIn"
        ? "Welcome back to CookSnap"
        : "Join CookSnap"
      : "Verify Your Email";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-muted">
          <CardHeader className="text-center space-y-2">
            <Flame className="w-8 h-8 text-primary mx-auto animate-pulse" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
              {titleText}
            </CardTitle>
          </CardHeader>
          <CardContent>{AuthForm()}</CardContent>
        </Card>
      </div>
    </main>
  );
}
