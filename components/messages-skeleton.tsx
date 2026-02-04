import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MessagesSkeleton() {
  return (
    <div className="container py-8">
      <Skeleton className="h-9 w-32 mb-8" />

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-1 space-y-2">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="md:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-4 space-y-4">
              <div className="flex justify-start">
                <Skeleton className="h-16 w-48 rounded-lg" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-12 w-40 rounded-lg" />
              </div>
              <div className="flex justify-start">
                <Skeleton className="h-20 w-56 rounded-lg" />
              </div>
              <div className="flex justify-end">
                <Skeleton className="h-12 w-36 rounded-lg" />
              </div>
            </CardContent>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
