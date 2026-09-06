import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, Eye } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ListingViewsChart } from "@/components/listing-views-chart";

interface ListingMetricsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; to?: string }>;
}

function dhakaDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function rangeStart(value: string) {
  return new Date(`${value}T00:00:00+06:00`);
}

function rangeEnd(value: string) {
  return new Date(`${value}T23:59:59.999+06:00`);
}

function validDate(value: string | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = rangeStart(value);
  return Number.isNaN(parsed.getTime()) || dhakaDate(parsed) !== value ? null : value;
}

function dateBefore(days: number) {
  return dhakaDate(new Date(Date.now() - days * 86_400_000));
}

export default async function ListingMetricsPage({ params, searchParams }: ListingMetricsPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/dashboard/listings/${id}/metrics`);

  const listing = await prisma.listing.findFirst({
    where: { id, userId: user.id, status: { not: "DELETED" } },
    select: { id: true, slug: true, title: true },
  });
  if (!listing) notFound();

  const query = await searchParams;
  const today = dhakaDate(new Date());
  let from = validDate(query.from) ?? dateBefore(29);
  let to = validDate(query.to) ?? today;
  if (rangeEnd(to).getTime() > rangeEnd(today).getTime()) to = today;
  if (rangeStart(from).getTime() > rangeEnd(to).getTime()) from = to;

  const views = await prisma.listingViewEvent.findMany({
    where: {
      listingId: id,
      createdAt: { gte: rangeStart(from), lte: rangeEnd(to) },
    },
    select: { source: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const dailyViews = new Map<string, number>();
  let googleViews = 0;
  let facebookViews = 0;
  for (const view of views) {
    const day = dhakaDate(view.createdAt);
    dailyViews.set(day, (dailyViews.get(day) ?? 0) + 1);
    if (view.source === "Google") googleViews += 1;
    if (view.source === "Facebook") facebookViews += 1;
  }
  const chartData = Array.from(dailyViews, ([date, count]) => ({ date, views: count }));

  return (
    <div className="container space-y-8 px-4 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon" aria-label="Back to my listings">
            <Link href="/dashboard/listings">
              <ArrowLeft />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Listing metrics</h1>
          </div>
        </div>
        <Button variant="outline" asChild>
          <Link href={`/listings/${listing.slug}`}>View listing</Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="from">From</Label>
                <Input id="from" name="from" type="date" defaultValue={from} max={to} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input id="to" name="to" type="date" defaultValue={to} min={from} max={today} />
              </div>
            </div>
            <Button type="submit">
              <CalendarDays className="h-4 w-4" />
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Total views</span>
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <p className="text-4xl font-bold text-primary">{views.length.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Traffic from Google</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">G</span>
            </div>
            <p className="text-4xl font-bold text-primary">{googleViews.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="mb-5 flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Traffic from Facebook</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">f</span>
            </div>
            <p className="text-4xl font-bold text-primary">{facebookViews.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Views over time</CardTitle>
        </CardHeader>
        <CardContent>
          <ListingViewsChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
