import Image from "next/image";
import Link from "next/link";
import { Package } from "lucide-react";

interface ListingImage {
  url: string;
}

interface Location {
  address: string;
}

interface Listing {
  id: string;
  title: string;
  slug: string;
  price: number;
  negotiable: boolean;
  status: string;
  createdAt: Date;
  images: ListingImage[];
  location: Location;
}

interface ListingCardProps {
  listing: Listing;
  showStatus?: boolean;
}

export function ListingCard({ listing, showStatus }: ListingCardProps) {
  const imageUrl = listing.images[0]?.url;
  const showStatusBadge = showStatus && listing.status !== "ACTIVE";

  return (
    <Link
      href={`/listings/${listing.slug}`}
      className="group flex aspect-square min-w-0 flex-col overflow-hidden border border-[#014069]/15 bg-white transition-colors hover:border-[#014069] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#014069]"
    >
      <div className="relative min-h-0 flex-1 bg-white">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={listing.title}
            fill
            sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[#014069]/40" aria-hidden="true">
            <Package className="h-10 w-10" strokeWidth={1.5} />
          </div>
        )}
        {showStatusBadge && (
          <span className="absolute left-2 top-2 border border-[#014069]/15 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#014069]">
            {listing.status}
          </span>
        )}
      </div>
      <div className="flex min-h-16 shrink-0 flex-col justify-center gap-1 border-t border-[#014069]/10 bg-[#f5f8fa] px-3 py-2.5">
        <h3 className="line-clamp-1 text-sm font-semibold leading-tight text-[#014069]">{listing.title}</h3>
        <p className="truncate text-xs text-[#014069]/65">
          <span className="font-semibold text-[#014069]">৳{listing.price.toLocaleString()}</span>
          {" · "}
          {listing.location.address}
        </p>
      </div>
    </Link>
  );
}
