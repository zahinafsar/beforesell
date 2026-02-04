"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { MessageCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";

interface Conversation {
  id: string;
  listing: {
    id: string;
    title: string;
    images: { url: string }[];
  };
  otherUser: {
    id: string;
    name: string;
    avatar: string | null;
    lastSeen: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

function isOnline(lastSeen: string): boolean {
  return new Date(lastSeen).getTime() > Date.now() - 5 * 60 * 1000;
}

function formatTime(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function MessagesList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const listingId = searchParams.get("listing");
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 5000,
  });

  const createConversation = useMutation({
    mutationFn: async (listingId: string) => {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, content: "Hi, I'm interested in this item." }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create conversation");
      }
      return res.json();
    },
    onSuccess: (data) => {
      router.push(`/messages/${data.conversationId}`);
    },
  });

  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (listingId && user && !authLoading && !isLoading && !hasTriggeredRef.current) {
      const existingConv = data?.conversations?.find(
        (c: Conversation) => c.listing.id === listingId
      );
      if (existingConv) {
        hasTriggeredRef.current = true;
        router.replace(`/messages/${existingConv.id}`);
      } else if (!createConversation.isPending) {
        hasTriggeredRef.current = true;
        createConversation.mutate(listingId);
      }
    }
  }, [listingId, user, authLoading, isLoading, data, createConversation.isPending]);

  if (authLoading || isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (createConversation.isPending) {
    return (
      <div className="container py-8 flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Starting conversation...</p>
      </div>
    );
  }

  if (createConversation.isError) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-destructive">{createConversation.error.message}</p>
            <Link href="/" className="text-primary hover:underline text-sm mt-2 block">
              Go back home
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const conversations: Conversation[] = data?.conversations || [];

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-2">No conversations yet</h2>
            <p className="text-muted-foreground mb-4">
              Start a conversation by messaging a seller on their listing
            </p>
            <Link href="/search" className="text-primary hover:underline">
              Browse listings
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link key={conv.id} href={`/messages/${conv.id}`}>
              <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="relative">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={conv.otherUser?.avatar || undefined} />
                        <AvatarFallback>
                          {conv.otherUser?.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {conv.otherUser && isOnline(conv.otherUser.lastSeen) && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {conv.otherUser?.name || "Unknown"}
                        </h3>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                          {conv.lastMessage ? formatTime(conv.lastMessage.createdAt) : ""}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mb-1">
                        {conv.listing.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm truncate text-muted-foreground">
                          {conv.lastMessage?.content || "No messages yet"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="ml-2 h-5 min-w-5 flex items-center justify-center">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
