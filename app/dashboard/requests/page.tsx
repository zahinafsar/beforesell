import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Edit, MapPin, MessageCircle, PackageSearch, Plus, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatBudgetRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const requestsPerPage = 12;

const statusLabels = {
  OPEN: "Open",
  FULFILLED: "Fulfilled",
  CLOSED: "Closed",
  DELETED: "Deleted",
};

const promotionLabels = {
  PENDING_REVIEW: "Boost pending",
  PROCESSING: "Boost processing",
  APPROVED: "Boosted",
  REJECTED: "Boost rejected",
};

interface MyRequestsPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function MyRequestsPage({ searchParams }: MyRequestsPageProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/requests");
  }

  const query = await searchParams;
  const parsedPage = Number.parseInt(query.page ?? "1", 10);
  let page = 1;
  if (Number.isFinite(parsedPage) && parsedPage > 0) {
    page = parsedPage;
  }
  const where = {
    userId: user.id,
    status: { not: "DELETED" as const },
  };

  const [requests, totalRequests] = await Promise.all([
    prisma.productRequest.findMany({
      where,
      include: {
        location: { select: { address: true } },
        promotions: { orderBy: { submittedAt: "desc" }, take: 1, select: { status: true } },
        _count: { select: { conversations: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * requestsPerPage,
      take: requestsPerPage,
    }),
    prisma.productRequest.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalRequests / requestsPerPage));
  if (page > totalPages) redirect(`/dashboard/requests?page=${totalPages}`);

  return (
    <div className="container px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold">My Requests</h1>
        <Button className="w-full sm:w-auto" asChild>
          <Link href="/requests/new">
            <Plus className="h-4 w-4" />
            Request a Product
          </Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageSearch className="mb-3 h-10 w-10 text-muted-foreground" />
            <p className="mb-4 text-muted-foreground">
              You haven&apos;t requested any products yet
            </p>
            <Button asChild>
              <Link href="/requests/new">
                <Plus className="h-4 w-4" />
                Post Your First Request
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {requests.map((productRequest) => {
              const latestPromotion = productRequest.promotions[0];
              return (
                <Card key={productRequest.id} className="gap-0 overflow-hidden py-0 transition-colors hover:border-primary/40">
                  <CardContent className="flex h-full flex-col p-0">
                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-3 flex flex-wrap gap-2">
                        <Badge variant={productRequest.status === "OPEN" ? "default" : "outline"}>
                          {statusLabels[productRequest.status]}
                        </Badge>
                        {latestPromotion && (
                          <Badge variant="secondary">{promotionLabels[latestPromotion.status]}</Badge>
                        )}
                      </div>
                      <h3 className="truncate font-semibold">
                        <Link href={`/requests/${productRequest.slug}`} className="hover:underline">
                          {productRequest.title}
                        </Link>
                      </h3>
                      <p className="mt-1 text-xl font-bold text-primary">
                        {formatBudgetRange(productRequest.minBudget, productRequest.maxBudget)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {productRequest._count.conversations} offers
                        </span>
                        <span className="flex min-w-0 items-center gap-1">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{productRequest.location.address}</span>
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-flow-col auto-cols-fr gap-2 border-t p-3">
                      {productRequest.status === "OPEN" ? (
                        <Button size="sm" className="w-full" asChild>
                          <Link href={`/requests/${productRequest.slug}/boost`}>
                            <Sparkles className="h-4 w-4" />
                            Boost
                          </Link>
                        </Button>
                      ) : null}
                      <Button variant="outline" size="sm" className="w-full" asChild>
                        <Link href={`/requests/new?id=${productRequest.id}`} aria-label={`Edit ${productRequest.title}`}>
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 ? (
            <nav className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between" aria-label="My requests pagination">
              <p className="text-sm text-muted-foreground">
                Page {page} of {totalPages} · {totalRequests} requests
              </p>
              <div className="grid grid-cols-2 gap-2 sm:flex">
                {page > 1 ? (
                  <Button variant="outline" asChild>
                    <Link href={`/dashboard/requests?page=${page - 1}`}>
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
                    <Link href={`/dashboard/requests?page=${page + 1}`}>
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
