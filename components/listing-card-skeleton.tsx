import { Skeleton } from "@/components/ui/skeleton";

export function ListingCardSkeleton() {
  return (
    <div className="flex aspect-square flex-col overflow-hidden border border-[#014069]/15 bg-white">
      <div className="min-h-0 flex-1">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex min-h-16 shrink-0 flex-col justify-center gap-1.5 border-t border-[#014069]/10 bg-[#f5f8fa] px-3 py-2.5">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </div>
  );
}
