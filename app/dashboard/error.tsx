"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCcw, LogIn } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="container px-4 flex items-center justify-center min-h-[60vh] py-16">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Dashboard Error</CardTitle>
          <CardDescription>
            We couldn&apos;t load your dashboard. Please try again or log in again if the issue persists.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <Button onClick={reset}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Log In Again
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
