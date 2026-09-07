import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Plus, Eye, Edit, Sparkles, ChartNoAxesCombined, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

const listingsPerPage = 12;

interface MyListingsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function MyListingsPage({ searchParams }: MyListingsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/listings");
  }

  const query = await searchParams;
  const parsedPage = Number.parseInt(query.page ?? "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const where = {
    userId: user.id,
    status: { not: "DELETED" as const },
  };

  const [listings, totalListings] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        images: { orderBy: { order: "asc" }, take: 1 },
        location: true,
        _count: { select: { viewEvents: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * listingsPerPage,
      take: listingsPerPage,
    }),
    prisma.listing.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalListings / listingsPerPage));
  if (page > totalPages) redirect(`/dashboard/listings?page=${totalPages}`);

  return (
    <div className="container px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Button className="w-full sm:w-auto" asChild>
          <Link href="/listings/new">
            <Plus className="h-4 w-4 mr-2" />
            Post New Ad
          </Link>
        </Button>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t posted any ads yet
            </p>
            <Button asChild>
              <Link href="/listings/new">
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Ad
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => (
              <Card key={listing.id} className="gap-0 overflow-hidden py-0 transition-colors hover:border-primary/40">
                <CardContent className="flex h-full flex-col p-0">
                  <Link href={`/listings/${listing.slug}`} className="relative aspect-[16/10] w-full bg-gray-100">
                    {listing.images[0] ? (
                      <Image
                        src={listing.images[0].url}
                        alt={listing.title}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                        No image
                      </div>
                    )}
                    <Badge
                      className="absolute left-3 top-3"
                      variant={
                        listing.status === "ACTIVE"
                          ? "default"
                          : listing.status === "SOLD"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {listing.status}
                    </Badge>
                  </Link>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="truncate font-semibold">
                      <Link href={`/listings/${listing.slug}`} className="hover:underline">
                        {listing.title}
                      </Link>
                    </h3>
                    <p className="mt-1 text-xl font-bold text-primary">
                      ৳ {listing.price.toLocaleString()}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {listing._count.viewEvents} views
                      </span>
                      <span className="flex min-w-0 items-center gap-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {listing.location.address}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-flow-col auto-cols-fr gap-2 border-t p-3">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/dashboard/listings/${listing.id}/metrics`}>
                        <ChartNoAxesCombined className="h-4 w-4" />
                        Metrics
                      </Link>
                    </Button>
                    {listing.status === "ACTIVE" ? (
                      <Button size="sm" className="w-full" asChild>
                        <Link href={`/listings/${listing.slug}/boost`}>
                          <Sparkles className="h-4 w-4" />
                          Boost
                        </Link>
                      </Button>
                    ) : null}
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/dashboard/listings/${listing.id}/edit`} aria-label={`Edit ${listing.title}`}>
                        <Edit className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {totalPages > 1 ? (
            <nav className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between" aria-label="My listings pagination">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} · {totalListings} listings
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                {page > 1 ? (
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/listings?page=${page - 1}`}>
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                )}
                {page < totalPages ? (
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/listings?page=${page + 1}`}>
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" disabled>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </nav>
          ) : null}
        </div>
      )}
    </div>
  );
}
