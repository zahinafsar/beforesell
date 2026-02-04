import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Calendar, Search } from "lucide-react";
import { RemoveFavoriteButton } from "@/components/remove-favorite-button";

export default async function FavoritesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/favorites");
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          location: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const listings = favorites.filter((f) => f.listing.status !== "DELETED");

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="text-muted-foreground">
              {listings.length} saved {listings.length === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-4 text-center">
              Start exploring and save items you like!
            </p>
            <Button asChild>
              <Link href="/search">
                <Search className="h-4 w-4 mr-2" />
                Browse Listings
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((fav) => (
            <Card key={fav.id} className="overflow-hidden group">
              <Link href={`/listings/${fav.listing.id}`}>
                <div className="relative aspect-[4/3] bg-gray-100">
                  {fav.listing.images[0] ? (
                    <Image
                      src={fav.listing.images[0].url}
                      alt={fav.listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No image
                    </div>
                  )}
                  {fav.listing.status === "SOLD" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">SOLD</span>
                    </div>
                  )}
                </div>
              </Link>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-lg font-bold text-primary">
                      ৳ {fav.listing.price.toLocaleString()}
                    </p>
                    <h3 className="font-medium line-clamp-2 text-sm mb-2">
                      <Link
                        href={`/listings/${fav.listing.id}`}
                        className="hover:underline"
                      >
                        {fav.listing.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {fav.listing.location.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(fav.createdAt)}
                      </span>
                    </div>
                  </div>
                  <RemoveFavoriteButton listingId={fav.listing.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(date).toLocaleDateString();
}
