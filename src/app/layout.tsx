import { ConvexClientProvider } from "@/components/providers/ConvexClientProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const isProd = process.env.NODE_ENV === "production";
const siteURL = isProd ? "https://www.cooksnap.app" : "http://localhost:3000";

export const metadata: Metadata = {
  title:
    "CookSnap – Share Recipes, Discover New Dishes, and Connect with Food Lovers",
  description:
    "CookSnap is a social platform for cooks and food lovers. Share your recipes, explore culinary creations, and get inspired by a global cooking community.",
  keywords: [
    "CookSnap",
    "recipe sharing app",
    "cooking inspiration",
    "food community",
    "culinary platform",
    "home cooking",
    "share dishes",
    "discover recipes",
    "meal ideas",
  ],
  metadataBase: new URL(siteURL),
  openGraph: {
    images: "/opengraph-image.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ConvexClientProvider>{children}</ConvexClientProvider>
          </ThemeProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
