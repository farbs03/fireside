import type React from "react";
import { HydrateClient } from "~/trpc/server";
import Navbar from "~/components/navbar";
import { MapPin, Users, Route } from "lucide-react";
import Image from "next/image";

function CustomButton({
  size = "default",
  variant = "default",
  className = "",
  children,
  ...props
}: {
  size?: "default" | "lg";
  variant?: "default" | "outline" | "secondary";
  className?: string;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
  const sizeStyles = {
    default: "h-10 px-4 py-2",
    lg: "h-11 px-8",
  };
  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default async function Home() {
  return (
    <HydrateClient>
      <main className="min-h-screen bg-background">
        <Navbar />

        {/* Hero Section */}
        <section className="relative">
          <div className="container px-4 py-24 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Find Your Safe Path Through Wildfires
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Fireside helps you locate safe evacuation routes to nearby
                    safe zones for food, water, and medical needs.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <CustomButton
                    size="lg"
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Locate Nearest Fireside
                  </CustomButton>
                </div>
              </div>
              <div className="rounded-xl border bg-card p-6 shadow-lg">
                <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                  <Image
                    alt="world"
                    src="/world-map.webp"
                    fill
                    className="rounded-lg object-cover"
                  />
                  {/* Map Placeholder */}
                  <div
                    className="absolute inset-0 flex items-center justify-center bg-black/10"
                    style={{ backgroundImage: "/world-map.webp" }}
                  >
                    <MapPin className="h-12 w-12 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-muted/50">
          <div className="container px-4 py-16 md:py-24">
            <h2 className="mb-12 text-center text-3xl font-bold">
              Life-Saving Features
            </h2>
            <div className="mx-auto grid w-full max-w-7xl gap-8 md:grid-cols-1 lg:grid-cols-3">
              <FeatureCard
                icon={<Route className="h-6 w-6" />}
                title="Safe Route Planning"
                description="Get real-time navigation that avoids active wildfire zones"
              />
              <FeatureCard
                icon={<MapPin className="h-6 w-6" />}
                title="Fireside Locations"
                description="Find nearby emergency shelters, food banks, and safe zones"
              />
              <FeatureCard
                icon={<Users className="h-6 w-6" />}
                title="Community Network"
                description="Connect with verified safe zones and emergency services"
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-red-600 text-white">
          <div className="container px-4 py-16 md:py-24">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-bold">Need Immediate Assistance?</h2>
              <p className="mx-auto max-w-2xl text-red-100">
                Don't wait until it's too late. Find your nearest safe zone or
                plan your evacuation route now.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <CustomButton
                  size="lg"
                  variant="secondary"
                  className="bg-white text-red-600 hover:bg-red-50"
                >
                  View Firesides
                </CustomButton>
              </div>
            </div>
          </div>
        </section>
      </main>
    </HydrateClient>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-4 text-red-600">{icon}</div>
      <h3 className="mb-2 font-semibold">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
