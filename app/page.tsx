import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Camera, ChefHat, ChevronRight, Flame, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full relative">
        <div className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <div>
            <Flame className="text-primary w-6 h-6" aria-hidden />
          </div>
          <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
            CookSnap
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground">
            <Heart
              className="w-4 h-4 text-rose-500 fill-rose-500"
              aria-hidden
            />
            <span className="font-mono">
              <span>100</span>+ food lovers
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="lg:flex-row flex flex-col-reverse justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full relative z-10">
        {/* Text Content */}
        <div className="max-w-2xl w-full text-center lg:text-left space-y-8">
          <div className="space-y-6">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <ChefHat className="w-4 h-4" aria-hidden />
                For food creators and enthusiasts
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight">
              <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                Share Your Passion
              </span>{" "}
              for Cooking
            </h1>

            <p className="text-lg text-muted-foreground">
              Join a vibrant community of chefs and food lovers. Snap your
              dishes, follow culinary creators, and inspire the world one plate
              at a time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <Button
              size="lg"
              className="px-8 group relative overflow-hidden"
              aria-label="Share a dish"
            >
              <span className="absolute inset-0 bg-primary/10" />
              <Camera className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              Share a Dish
              <ChevronRight className="ml-2 h-4 w-4 transition-all group-hover:translate-x-1" />
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="px-8 group border-2"
              aria-label="Explore recipes"
              asChild
            >
              <Link href="/home">
                <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                  Explore Recipes
                </span>
                <ChevronRight className="ml-2 h-4 w-4 text-primary transition-all group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Hero Image */}
        <div className="w-full max-w-md md:max-w-lg relative aspect-[4.3/5]">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-primary/30 to-amber-600/30 blur-xl opacity-70 -z-10" />

          <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl border-2 border-muted">
            <Image
              src="https://images.unsplash.com/photo-1717838207789-62684e75a770?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
              alt="Chef plating a gourmet dish in kitchen"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
