import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Calendar, Edit, MapPin, MessageCircle, PackageSearch, Phone, Sparkles } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { formatBudgetRange } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface RequestPageProps {
  params: Promise<{ slug: string }>;
}

const statusLabels = {
  OPEN: "Open",
  FULFILLED: "Fulfilled",
  CLOSED: "Closed",
  DELETED: "Deleted",
};

export async function generateMetadata({ params }: RequestPageProps): Promise<Metadata> {
  const { slug } = await params;
  const productRequest = await prisma.productRequest.findUnique({
    where: { slug },
    select: { title: true, description: true, minBudget: true, maxBudget: true, status: true },
  });

  if (!productRequest || productRequest.status === "DELETED") {
    return { title: "Request Not Found", robots: { index: false, follow: false } };
  }

  const title = `Wanted: ${productRequest.title}`;
  const summary = productRequest.description.replace(/\s+/g, " ").trim().slice(0, 150);
  const description = `${formatBudgetRange(productRequest.minBudget, productRequest.maxBudget)}. ${summary}`;

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
  };
}

export default async function RequestPage({ params }: RequestPageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();

  const productRequest = await prisma.productRequest.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, parent: { select: { name: true } } } },
      location: { select: { address: true } },
      user: { select: { id: true, name: true, avatar: true, phone: true, createdAt: true } },
    },
  });

  if (!productRequest || productRequest.status === "DELETED") {
    notFound();
  }

  const isOwner = user?.id === productRequest.userId;
  const isOpen = productRequest.status === "OPEN";
  const contactPhone = productRequest.phone || productRequest.user.phone;
  const chatPath = `/messages?request=${productRequest.id}`;
  let chatHref = chatPath;
  if (!user) {
    chatHref = `/login?redirect=${encodeURIComponent(chatPath)}`;
  }
  let categoryPath = "Any category";
  if (productRequest.category) {
    categoryPath = productRequest.category.name;
    if (productRequest.category.parent) {
      categoryPath = `${productRequest.category.parent.name} > ${productRequest.category.name}`;
    }
  }

  return (
    <div className="container px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <Badge className="gap-1">
                  <PackageSearch className="h-3.5 w-3.5" />
                  Wanted
                </Badge>
                <Badge variant="secondary">{categoryPath}</Badge>
                {!isOpen && <Badge variant="outline">{statusLabels[productRequest.status]}</Badge>}
              </div>

              <h1 className="mb-2 text-2xl font-bold">{productRequest.title}</h1>

              <div className="mb-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Budget</p>
                <p className="text-3xl font-bold text-primary">
                  {formatBudgetRange(productRequest.minBudget, productRequest.maxBudget)}
                </p>
              </div>

              <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {productRequest.location.address}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(productRequest.createdAt).toLocaleDateString()}
                </span>
              </div>

              <Separator className="my-6" />

              <h2 className="mb-3 text-lg font-semibold">Details</h2>
              <p className="whitespace-pre-wrap text-muted-foreground">{productRequest.description}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buyer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href={`/user/${productRequest.user.id}`} className="flex items-center gap-4 transition-opacity hover:opacity-80">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={productRequest.user.avatar || undefined} />
                  <AvatarFallback className="text-xl">
                    {productRequest.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{productRequest.user.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(productRequest.user.createdAt).getFullYear()}
                  </p>
                </div>
              </Link>

              {isOwner ? (
                <div className="grid gap-2 sm:grid-flow-col sm:auto-cols-fr">
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/requests/new?id=${productRequest.id}`}>
                      <Edit className="h-4 w-4" />
                      Edit Request
                    </Link>
                  </Button>
                  {isOpen && (
                    <Button asChild className="w-full">
                      <Link href={`/requests/${productRequest.slug}/boost`}>
                        <Sparkles className="h-4 w-4" />
                        Boost
                      </Link>
                    </Button>
                  )}
                </div>
              ) : isOpen ? (
                <div className="space-y-2">
                  {contactPhone && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`tel:${contactPhone}`}>
                        <Phone className="h-4 w-4" />
                        {contactPhone}
                      </a>
                    </Button>
                  )}
                  <Button className="w-full" asChild>
                    <Link href={chatHref}>
                      <MessageCircle className="h-4 w-4" />
                      I have this
                    </Link>
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  This request is no longer accepting offers.
                </p>
              )}

            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Safety Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Meet in a safe, public place</li>
                <li>Let the buyer inspect the item before payment</li>
                <li>Never share personal financial info</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
