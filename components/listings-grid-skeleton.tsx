import ListingCardSkeleton from "./listing-card-skeleton";

interface ListingsGridSkeletonProps {
  count?: number;
}

export default function ListingsGridSkeleton({ count = 8 }: ListingsGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
