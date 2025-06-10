import Resend from "@auth/core/providers/resend";
import { alphabet, generateRandomString } from "oslo/crypto";
import { Resend as ResendAPI } from "resend";

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    // Generates an 8-digit numeric code for easier typing and clarity
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);

    const { error } = await resend.emails.send({
      from: "CookSnap <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your CookSnap password",
      text: `Your CookSnap password reset code is: ${token}\n\nIf you didn’t request this, please ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
          <h2 style="color: #ff6b00;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>You requested to reset your CookSnap password. Use the code below to proceed:</p>
          <p style="font-size: 24px; font-weight: bold; color: #ff6b00;">${token}</p>
          <p>If you didn’t request this, you can safely ignore this email.</p>
          <br/>
          <p>Thanks,<br/>The CookSnap Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Could not send password reset email.");
    }
  },
});
