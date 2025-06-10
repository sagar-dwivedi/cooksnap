"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthActions } from "@convex-dev/auth/react";
import { Flame, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

type Step = "signIn" | "signUp" | { email: string };

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<Step>("signIn");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    try {
      if (step === "signIn" || step === "signUp") {
        await signIn("password", formData);
        const email = formData.get("email") as string;
        setStep({ email });
      } else {
        await signIn("password", formData);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    if (typeof step === "string") {
      const isSignIn = step === "signIn";

      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2 relative">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="pl-10"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2 relative">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="pl-10"
              />
            </div>
            {isSignIn && (
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

          <div className="space-y-2 pt-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : isSignIn ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => setStep(isSignIn ? "signUp" : "signIn")}
            >
              {isSignIn ? "Create a new account" : "Back to sign in"}
            </Button>
          </div>
        </form>
      );
    }

    // Email verification step
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

        <input name="flow" type="hidden" value="email-verification" />
        <input name="email" type="hidden" value={step.email} />

        <div className="space-y-2 pt-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Verify...
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-muted">
          <CardHeader className="text-center space-y-2">
            <Flame className="w-8 h-8 text-primary mx-auto animate-pulse" />
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
              {typeof step === "string"
                ? step === "signIn"
                  ? "Welcome back to CookSnap"
                  : "Join CookSnap"
                : "Verify Your Email"}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderForm()}</CardContent>
        </Card>
      </div>
    </main>
  );
}
