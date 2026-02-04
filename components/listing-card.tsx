import Image from "next/image";
import Link from "next/link";
import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ListingImage {
  url: string;
}

interface District {
  name: string;
  division: { name: string };
}

interface Listing {
  id: string;
  title: string;
  slug: string;
  price: number;
  negotiable: boolean;
  condition: string;
  status: string;
  views: number;
  createdAt: Date;
  images: ListingImage[];
  district: District;
}

interface ListingCardProps {
  listing: Listing;
  showStatus?: boolean;
}

export function ListingCard({ listing, showStatus }: ListingCardProps) {
  const imageUrl = listing.images[0]?.url || "/placeholder.png";

  return (
    <Link href={`/listings/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-[4/3] bg-gray-100">
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            className="object-cover"
          />
          {showStatus && listing.status !== "ACTIVE" && (
            <Badge
              variant={listing.status === "SOLD" ? "destructive" : "secondary"}
              className="absolute top-2 left-2"
            >
              {listing.status}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="text-lg font-bold text-primary mb-1">
            ৳ {listing.price.toLocaleString()}
            {listing.negotiable && (
              <span className="text-xs font-normal text-muted-foreground ml-1">
                (Nego)
              </span>
            )}
          </div>
          <h3 className="font-medium line-clamp-2 mb-2 text-sm">
            {listing.title}
          </h3>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1 truncate">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{listing.district.name}</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(listing.createdAt)}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
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
