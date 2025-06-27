"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const baseSchema = z.object({
  code: z.string().min(4, "Verification code is required"),
});

const resetSchema = baseSchema.extend({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .describe("New Password"),
});

type EmailVerificationFormValues = z.infer<typeof baseSchema>;
type ResetVerificationFormValues = z.infer<typeof resetSchema>;

interface OTPVerificationFormProps {
  email: string;
  flow: "reset-verification" | "email-verification";
  onCancel?: () => void;
}

export function OTPVerificationForm({
  email,
  flow,
  onCancel,
}: OTPVerificationFormProps) {
  const { signIn } = useAuthActions();

  const schema = flow === "reset-verification" ? resetSchema : baseSchema;


  const form = useForm<EmailVerificationFormValues | ResetVerificationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      newPassword: "",
    },
  });

  async function onSubmit(values: any) {
    const formData = new FormData();
    formData.append("code", values.code);
    formData.append("email", email);
    formData.append("flow", flow);
    if (flow === "reset-verification") {
      formData.append("newPassword", values.newPassword);
    }

    await signIn("password", formData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification Code</FormLabel>
              <FormControl>
                <Input placeholder="123456" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {flow === "reset-verification" && (
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-40"
          >
            {form.formState.isSubmitting ? "Verifying..." : "Continue"}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-40"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
