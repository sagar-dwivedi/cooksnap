"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthActions } from "@convex-dev/auth/react";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

type Step = "forgot" | { email: string };

export default function PasswordReset() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<Step>("forgot");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (step === "forgot") {
      await signIn("password", formData);
      const email = formData.get("email") as string;
      setStep({ email });
    } else {
      await signIn("password", formData);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-lg border-muted">
          <CardHeader className="text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-primary mx-auto animate-pulse" />
            <CardTitle className="text-2xl font-semibold bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
              {step === "forgot"
                ? "Reset Your Password"
                : "Enter Verification Code"}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === "forgot" ? (
                <>
                  {/* Email field */}
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

                  <input name="flow" type="hidden" value="reset" />

                  <Button type="submit" className="w-full">
                    Send Code
                  </Button>
                </>
              ) : (
                <>
                  {/* Code Field */}
                  <div className="space-y-2">
                    <label htmlFor="code" className="text-sm font-medium">
                      Code
                    </label>
                    <Input
                      id="code"
                      name="code"
                      type="text"
                      placeholder="123456"
                      required
                    />
                  </div>

                  {/* New Password Field */}
                  <div className="space-y-2 relative">
                    <label
                      htmlFor="newPassword"
                      className="text-sm font-medium"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <input name="email" type="hidden" value={step.email} />
                  <input name="flow" type="hidden" value="reset-verification" />

                  <div className="space-y-2">
                    <Button type="submit" className="w-full">
                      Continue
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-muted-foreground"
                      onClick={() => setStep("forgot")}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
