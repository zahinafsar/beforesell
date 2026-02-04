"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  listingId: string;
  isFavorited: boolean;
  isLoggedIn: boolean;
}

export default function FavoriteButton({ listingId, isFavorited, isLoggedIn }: FavoriteButtonProps) {
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
      const res = await fetch(`/api/listings/${listingId}/favorite`, {
        method: "POST",
      });

      if (res.ok) {
        setFavorited(!favorited);
      }
    } catch {
      // Silently fail
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
