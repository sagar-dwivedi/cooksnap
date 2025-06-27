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
import { z } from "zod/v4";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const baseSchema = z.object({
  code: z.string().min(8, "Verification code must be 6 characters").max(8),
});

const resetSchema = baseSchema.extend({
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[a-z]/, "Must contain at least one lowercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
});

type EmailVerificationFormValues = z.infer<typeof baseSchema>;
type ResetVerificationFormValues = z.infer<typeof resetSchema>;

type FlowType = "reset-verification" | "email-verification";

interface OTPVerificationFormProps {
  email: string;
  flow: FlowType;
  onCancel?: () => void;
  onSuccess?: () => void;
}

export function OTPVerificationForm({
  email,
  flow,
  onCancel,
  onSuccess,
}: OTPVerificationFormProps) {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const form = useForm<EmailVerificationFormValues | ResetVerificationFormValues>({
    resolver: zodResolver(flow === "reset-verification" ? resetSchema : baseSchema),
    defaultValues: {
      code: "",
      ...(flow === "reset-verification" ? { newPassword: "" } : {}),
    },
  });

  async function onSubmit(values: EmailVerificationFormValues | ResetVerificationFormValues) {
    try {
      const formData = new FormData();
      formData.append("code", values.code);
      formData.append("email", email);
      formData.append("flow", flow)
    
      if (flow === "reset-verification") {
        const resetValues = values as ResetVerificationFormValues;
        formData.append("newPassword", resetValues.newPassword);
      }

      const result = await signIn("password", formData);

      if (!result) {
        throw new Error("Verification failed. Please check your code and try again.");
      }

      toast.success(
        flow === "reset-verification" 
          ? "Password reset successfully!" 
          : "Email verified successfully!"
      );
    
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/home");
      }
    } catch (error) {
      toast.error(
        error instanceof Error 
          ? error.message 
          : "An unexpected error occurred during verification"
      );
    }
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
                <Input
                  placeholder="123456"
                  {...field}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                />
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
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...field}
                  />
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
            {form.formState.isSubmitting ? (
              <span className="flex items-center gap-2">
                <Spinner size="sm" />
                Verifying...
              </span>
            ) : (
              "Continue"
            )}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="w-40"
              disabled={form.formState.isSubmitting}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

// Simple spinner component (add to your UI components)
function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };
  
  return (
    <svg
      className={`animate-spin ${sizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
} 