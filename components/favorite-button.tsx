"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "@/lib/api";

export function FavoriteButton({ listingId, isFavorited, isLoggedIn }: { listingId: string; isFavorited: boolean; isLoggedIn: boolean }) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(isFavorited);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=/listings/${listingId}`);
      return;
    }

    setIsLoading(true);
    try {
      const res = await api("listings/[id]/favorite", {
        method: "POST",
        params: { id: listingId },
      });

      if (res.ok) {
        setFavorited(!favorited);
        toast.success(favorited ? "Removed from favorites" : "Added to favorites");
      } else {
        toast.error("Failed to update favorites");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={favorited ? "default" : "outline"}
      className="w-full"
      onClick={handleToggle}
      disabled={isLoading}
    >
      <Heart className={`h-4 w-4 mr-2 ${favorited ? "fill-current" : ""}`} />
      {favorited ? "Saved to Favorites" : "Add to Favorites"}
    </Button>
  );
}
