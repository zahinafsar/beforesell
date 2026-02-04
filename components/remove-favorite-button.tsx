"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RemoveFavoriteButtonProps {
  listingId: string;
}

export function RemoveFavoriteButton({ listingId }: RemoveFavoriteButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/favorite`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Removed from favorites");
        router.refresh();
      } else {
        toast.error("Failed to remove from favorites");
      }
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
      onClick={handleRemove}
      disabled={isLoading}
    >
      <Heart className="h-4 w-4 fill-current" />
    </Button>
  );
}
