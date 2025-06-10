import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";
import { alphabet, generateRandomString } from "oslo/crypto";

export const ResendOTP = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    // Generates a numeric 8-digit code
    return generateRandomString(8, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);

    const { error } = await resend.emails.send({
      from: "CookSnap <onboarding@resend.dev>",
      to: [email],
      subject: "Your CookSnap verification code",
      text: `Your CookSnap sign-in verification code is: ${token}\n\nIf you did not try to sign in, you can ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; color: #333; padding: 20px;">
          <h2 style="color: #ff6b00;">Welcome to CookSnap 👨‍🍳</h2>
          <p>Here's your verification code:</p>
          <p style="font-size: 28px; font-weight: bold; color: #ff6b00;">${token}</p>
          <p>This code will expire soon. If you didn’t try to sign in, you can safely ignore this email.</p>
          <br/>
          <p>Happy cooking,<br/>🍽️ The CookSnap Team</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend email verification error:", error);
      throw new Error("Could not send verification email.");
    }
  },
});
