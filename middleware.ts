import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";

const isLoginPage = createRouteMatcher(["/login"])
const isProtectedRoute = createRouteMatcher(["/home"])

export default convexAuthNextjsMiddleware(async (req, { convexAuth }) => {
  if (isLoginPage(req) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(req, "/home")
  }
  if (isProtectedRoute(req) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(req, "/login");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
