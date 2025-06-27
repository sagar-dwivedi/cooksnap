"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v4";
import { OTPVerificationForm } from "./otp-verification";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.email()
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;


export function ForgotPasswordForm() {
  const { signIn } = useAuthActions();
  const [step, setStep] = useState<"forgot" | { email: string }>("forgot");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    await signIn("password", { ...data, flow: "reset" });
    setStep({ email: data.email });
  }


  return (
    <div className={cn("mx-auto", step === "forgot" ? "max-w-md" : "max-w-7xl")}>
      <Card>
        <CardHeader>
          <CardTitle>Reset your password</CardTitle>
          <CardDescription>
            {step === "forgot"
              ? "Enter your email to receive a reset code."
              : "Enter the code sent to your email and a new password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "forgot" ? (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="w-full"
                >
                  {form.formState.isSubmitting ? "Sending..." : "Send Reset Code"}
                </Button>
              </form>
              <Link
                href="/login"
                className="mt-4 block w-full text-center text-sm text-muted-foreground hover:underline"
              >
                ← Back to Login
              </Link>
            </Form>
          ) : (
            <OTPVerificationForm
              email={step.email}
              flow="reset-verification"
              onCancel={() => setStep("forgot")}
            />
          )}

        </CardContent>
      </Card>
    </div>
  );
}
