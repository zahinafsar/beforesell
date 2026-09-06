import { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingCard } from "@/components/listing-card";
import { prisma } from "@/lib/prisma";
import { generateUserMetadata } from "@/lib/seo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Package } from "lucide-react";

interface UserProfilePageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: UserProfilePageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });

  if (!user) {
    return { title: "User Not Found" };
  }

  return generateUserMetadata({
    userName: user.name,
    userId: user.id,
    listingCount: user._count.listings,
    memberSince: new Date(user.createdAt).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
  });
}

export default async function UserProfilePage({ params }: UserProfilePageProps) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatar: true,
      createdAt: true,
      listings: {
        where: { status: "ACTIVE" },
        include: {
          images: { orderBy: { order: "asc" }, take: 1 },
          location: true,
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: {
          listings: { where: { status: "ACTIVE" } },
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  return (
    <div className="container px-4 py-8">
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Member since {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {user._count.listings} active listing{user._count.listings !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Active Listings ({user.listings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user.listings.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No active listings at the moment
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
              {user.listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
