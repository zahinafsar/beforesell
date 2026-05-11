import Image from "next/image";
import Link from "next/link";

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
  description?: string | null;
  price: number;
  negotiable: boolean;
  status: string;
  views: number;
  createdAt: Date;
  images: ListingImage[];
  location: Location;
}

interface ListingCardProps {
  listing: Listing;
  showStatus?: boolean;
}

export function ListingCard({ listing, showStatus }: ListingCardProps) {
  const imageUrl = listing.images[0]?.url || "/placeholder.png";
  const showStatusBadge = showStatus && listing.status !== "ACTIVE";

  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group relative block aspect-[3/4] overflow-hidden border bg-neutral-900"
    >
      <Image
        src={imageUrl}
        alt={listing.title}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
        className="object-cover"
      />

      <span className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur px-3 py-1.5 text-xs font-bold text-white whitespace-nowrap">
        ৳{listing.price.toLocaleString()}
        {listing.negotiable && (
          <span className="ml-1 font-normal text-white/70">· Nego</span>
        )}
      </span>

      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-1.5 max-w-[55%]">
        {showStatusBadge && (
          <span className="bg-black/70 backdrop-blur px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            {listing.status}
          </span>
        )}
        <span className="bg-white/20 backdrop-blur px-2.5 py-1 text-[10px] font-medium text-white truncate max-w-full">
          {listing.location.address}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 overflow-hidden">
        <div className="absolute inset-0 scale-110">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover blur-2xl"
            aria-hidden
          />
        </div>
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative flex flex-col gap-2 p-4 text-white">
          <h3 className="font-bold text-base leading-tight">
            {listing.title}
          </h3>
          {listing.description && (
            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
              <p className="text-xs text-white/80 leading-snug overflow-hidden line-clamp-4">
                {listing.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
