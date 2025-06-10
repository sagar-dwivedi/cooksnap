import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import { ResendOTP } from "./ResendOTP";
import { ResendOTPPasswordReset } from "./ResendOTPPasswordReset";
import { z } from "zod/v4";
import { ConvexError } from "convex/values";

const ParamsSchema = z.object({
  email: z.email(),
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Password({
      profile(params) {
        const { error, data } = ParamsSchema.safeParse(params);
        if (error) {
          throw new ConvexError(z.treeifyError(error));
        }
        return { email: data.email };
      },
      reset: ResendOTPPasswordReset,
      verify: ResendOTP,
    }),
  ],
});
