"use client";

import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { Camera, ChefHat, ChevronRight, Flame, Heart } from "lucide-react";
import { animate, motion, useMotionValue, useTransform } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const MotionButton = motion.create(Button);

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export default function LandingPage() {
  const [isHovered, setIsHovered] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, 100, {
      duration: 10,
      ease: "linear",
    });

    return animation.stop;
  }, [count]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full relative z-10">
        <motion.div
          className="text-lg sm:text-xl font-bold flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 3 }}
          >
            <Flame className="text-primary w-6 h-6" aria-hidden />
          </motion.div>
          <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
            CookSnap
          </span>
        </motion.div>

        <div className="flex items-center gap-4">
          <motion.div
            className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <Heart
              className="w-4 h-4 text-rose-500 fill-rose-500"
              aria-hidden
            />
            <span className="font-mono">
              <motion.span>{rounded}</motion.span>+ food lovers
            </span>
          </motion.div>
          <ModeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="lg:flex-row flex flex-col-reverse justify-between items-center px-4 sm:px-6 lg:px-8 py-4 sm:py-6 max-w-7xl mx-auto w-full relative z-10">
        {/* Text Content */}
        <motion.div
          className="max-w-2xl w-full text-center lg:text-left space-y-8"
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.6, ease: "backOut" }}
        >
          <div className="space-y-6">
            <motion.div variants={fadeIn} transition={{ delay: 0.3 }}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <ChefHat className="w-4 h-4" aria-hidden />
                For food creators and enthusiasts
              </span>
            </motion.div>

            <motion.h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-tight"
              variants={fadeInUp}
              transition={{ delay: 0.2 }}
            >
              <span className="bg-gradient-to-r from-primary to-amber-600 bg-clip-text text-transparent">
                Share Your Passion
              </span>{" "}
              for Cooking
            </motion.h1>

            <motion.p
              className="text-lg text-muted-foreground"
              variants={fadeIn}
              transition={{ delay: 0.4 }}
            >
              Join a vibrant community of chefs and food lovers. Snap your
              dishes, follow culinary creators, and inspire the world one plate
              at a time.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            variants={fadeIn}
            transition={{ delay: 0.5 }}
          >
            <MotionButton
              size="lg"
              className="px-8 group relative overflow-hidden"
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              aria-label="Share a dish"
            >
              <motion.span
                className="absolute inset-0 bg-primary/10"
                initial={{ scale: 0 }}
                animate={{ scale: isHovered ? 1 : 0 }}
                transition={{ duration: 0.6 }}
              />
              <Camera className="mr-2 h-5 w-5 transition-transform group-hover:rotate-12" />
              Share a Dish
              <ChevronRight className="ml-2 h-4 w-4 transition-all group-hover:translate-x-1" />
            </MotionButton>

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
          </motion.div>

          <motion.div
            className="pt-4 flex flex-wrap justify-center lg:justify-start gap-3"
            variants={fadeIn}
            transition={{ delay: 0.6 }}
          >
            {["Italian", "Japanese", "Vegan", "Desserts", "BBQ"].map(
              (cuisine) => (
                <motion.span
                  key={cuisine}
                  className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground border"
                  whileHover={{
                    scale: 1.1,
                    backgroundColor: "hsl(var(--primary))",
                    color: "white",
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {cuisine}
                </motion.span>
              )
            )}
          </motion.div>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          className="w-full max-w-md md:max-w-lg relative aspect-[4.3/5]"
          initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, delay: 0.3, type: "spring" }}
        >
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
        </motion.div>
      </section>
    </main>
  );
}
