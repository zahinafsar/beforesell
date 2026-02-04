import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ListingsGridSkeleton from "./listings-grid-skeleton";

export default function UserProfileSkeleton() {
  return (
    <div className="container py-8">
      <div className="grid gap-8 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-7 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Skeleton className="h-8 w-10 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Skeleton className="h-8 w-10 mx-auto mb-1" />
                  <Skeleton className="h-3 w-12 mx-auto" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-7 w-48" />
          </div>
          <ListingsGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
