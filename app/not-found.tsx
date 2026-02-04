"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-16 text-center">
      <div className="space-y-4">
        <h1 className="text-8xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Page Not Found</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mt-8">
        <Button asChild>
          <Link href="/">
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/search">
            <Search className="h-4 w-4 mr-2" />
            Browse Listings
          </Link>
        </Button>
        <Button variant="ghost" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}
