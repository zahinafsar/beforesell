import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { generateListingMetadata, generateListingJsonLd, generateBreadcrumbJsonLd, getBaseUrl } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MapPin, Eye, Calendar, Phone, MessageCircle, Edit } from "lucide-react";
import { ListingImageGallery } from "@/components/listing-image-gallery";
import { FavoriteButton } from "@/components/favorite-button";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { order: "asc" }, take: 1 },
      location: true,
      user: { select: { name: true } },
    },
  });

  if (!listing || listing.status === "DELETED") {
    return { title: "Listing Not Found" };
  }

  return generateListingMetadata({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    image: listing.images[0]?.url,
    location: listing.location.address,
    listingId: listing.id,
    sellerName: listing.user.name,
  });
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      category: { include: { parent: true } },
      location: true,
      images: { orderBy: { order: "asc" } },
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
          phone: true,
          createdAt: true,
          _count: { select: { listings: { where: { status: "ACTIVE" } } } },
        },
      },
      _count: { select: { favorites: true } },
      attributeValues: {
        include: {
          attribute: {
            select: { name: true, slug: true, type: true, unit: true, order: true },
          },
        },
      },
    },
  });

  if (!listing || listing.status === "DELETED") {
    notFound();
  }

  // Increment view
  await prisma.listing.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  const isFavorited = user
    ? await prisma.favorite.findUnique({
        where: { userId_listingId: { userId: user.id, listingId: id } },
      })
    : null;

  const isOwner = user?.id === listing.userId;
  const categoryPath = listing.category?.parent
    ? `${listing.category.parent.name} > ${listing.category.name}`
    : listing.category?.name || "Uncategorized";

  const location = listing.location.address;
  const baseUrl = getBaseUrl();

  const listingJsonLd = generateListingJsonLd({
    title: listing.title,
    description: listing.description,
    price: listing.price,
    image: listing.images[0]?.url,
    location,
    listingId: listing.id,
    sellerName: listing.user.name,
    createdAt: listing.createdAt,
    negotiable: listing.negotiable,
  });

  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Categories", url: `${baseUrl}/categories` },
    ...(listing.category?.parent
      ? [{ name: listing.category.parent.name, url: `${baseUrl}/categories/${listing.category.parent.slug}` }]
      : []),
    { name: listing.category?.name || "Uncategorized", url: `${baseUrl}/categories/${listing.category?.slug}` },
    { name: listing.title, url: `${baseUrl}/listings/${listing.id}` },
  ];

  const breadcrumbJsonLd = generateBreadcrumbJsonLd(breadcrumbItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="container px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ListingImageGallery images={listing.images} title={listing.title} />

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{categoryPath}</Badge>
                {listing.status === "SOLD" && (
                  <Badge variant="destructive">Sold</Badge>
                )}
              </div>

              <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>

              <div className="text-3xl font-bold text-primary mb-4">
                ৳ {listing.price.toLocaleString()}
                {listing.negotiable && (
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    (Negotiable)
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.location.address}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {listing.views + 1} views
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(listing.createdAt).toLocaleDateString()}
                </span>
              </div>

              {listing.attributeValues.length > 0 && (
                <>
                  <Separator className="my-6" />
                  <h2 className="text-lg font-semibold mb-3">Specifications</h2>
                  <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                    {listing.attributeValues
                      .sort((a, b) => a.attribute.order - b.attribute.order)
                      .map((av) => (
                        <div key={av.attribute.slug} className="flex justify-between">
                          <span className="text-muted-foreground">{av.attribute.name}</span>
                          <span className="font-medium">
                            {av.attribute.type === "BOOLEAN"
                              ? av.value === "true"
                                ? "Yes"
                                : "No"
                              : av.value}
                            {av.attribute.unit && av.attribute.type === "NUMBER" && (
                              <span className="text-muted-foreground ml-1">
                                {av.attribute.unit}
                              </span>
                            )}
                          </span>
                        </div>
                      ))}
                  </div>
                </>
              )}

              <Separator className="my-6" />

              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">
                {listing.description}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Seller Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href={`/user/${listing.user.id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={listing.user.avatar || undefined} />
                  <AvatarFallback className="text-xl">
                    {listing.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{listing.user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(listing.user.createdAt).getFullYear()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {listing.user._count.listings} active listing
                    {listing.user._count.listings !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>

              {isOwner ? (
                <Button asChild className="w-full">
                  <Link href={`/dashboard/listings/${listing.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Listing
                  </Link>
                </Button>
              ) : (
                <div className="space-y-2">
                  {(listing.phone || listing.user.phone) && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${listing.phone || listing.user.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        {listing.phone || listing.user.phone}
                      </a>
                    </Button>
                  )}
                  <Button className="w-full" asChild>
                    <Link href={user ? `/messages?listing=${listing.id}` : "/login"}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Link>
                  </Button>
                  <FavoriteButton
                    listingId={listing.id}
                    isFavorited={!!isFavorited}
                    isLoggedIn={!!user}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Safety Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Meet in a safe, public place</li>
                <li>Check the item before payment</li>
                <li>Pay only after inspecting the item</li>
                <li>Never share personal financial info</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
}
