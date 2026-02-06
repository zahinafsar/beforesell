"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { usePresence } from "@/hooks/use-presence";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  Send,
  MessageCircle,
  MoreVertical,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/providers/auth-provider";
import { conversationsQuery } from "@/lib/queries";
import { api } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function isOnline(lastSeen: string | Date) {
  return new Date(lastSeen).getTime() > Date.now() - 5 * 60 * 1000;
}

function formatTime(date: string | Date) {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000)
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function formatMessageTime(date: string | Date) {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMessageDate(date: string | Date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const conversationId = searchParams.get("conversation");
  const listingId = searchParams.get("listing");

  const { user, isLoading: authLoading } = useAuth();
  const authKey = user?.id;

  // Track presence — instantly marks offline on tab close/browser close
  usePresence(!!user);

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasTriggeredRef = useRef(false);

  // Fetch conversations list
  const { data: listData, isLoading: listLoading } = useQuery(
    conversationsQuery(authKey).list()
  );

  // Fetch selected conversation
  const { data: convData, isLoading: convLoading, refetch: refetchConv } = useQuery({
    ...conversationsQuery(authKey).byId({ id: conversationId || "" }),
    enabled: !!conversationId,
  });

  // Create conversation mutation (for ?listing= param)
  const createConversation = useMutation({
    mutationFn: async (listingId: string) => {
      const res = await api("conversations", {
        method: "POST",
        body: { listingId, content: "Hi, I'm interested in this item." },
      });
      if (!res.ok) {
        const error = (await res.json()) as { error?: string };
        throw new Error(error.error || "Failed to create conversation");
      }
      return res.json() as Promise<{ conversationId: string }>;
    },
    onSuccess: (data) => {
      router.replace(`/messages?conversation=${data.conversationId}`);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await api("conversations/[id]/messages", {
        method: "POST",
        params: { id: conversationId! },
        body: { content },
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      refetchConv();
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    },
  });

  // Handle ?listing= param to create/find conversation
  useEffect(() => {
    if (
      listingId &&
      user &&
      !authLoading &&
      !listLoading &&
      !hasTriggeredRef.current
    ) {
      const existingConv = listData?.conversations?.find(
        (c) => c.listing.id === listingId
      );
      if (existingConv) {
        hasTriggeredRef.current = true;
        router.replace(`/messages?conversation=${existingConv.id}`);
      } else if (!createConversation.isPending) {
        hasTriggeredRef.current = true;
        createConversation.mutate(listingId);
      }
    }
  }, [
    listingId,
    user,
    authLoading,
    listLoading,
    listData,
    createConversation,
    router,
  ]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [convData?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !sendMessage.isPending) {
      sendMessage.mutate(newMessage.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const selectConversation = (id: string) => {
    router.push(`/messages?conversation=${id}`, { scroll: false });
  };

  const conversations = listData?.conversations || [];
  const selectedConv = convData?.conversation;
  const messages = convData?.messages || [];

  // Group messages by date
  const messagesByDate: Record<string, typeof messages> = {};
  messages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!messagesByDate[dateKey]) messagesByDate[dateKey] = [];
    messagesByDate[dateKey].push(msg);
  });

  const online =
    selectedConv?.otherUser && isOnline(selectedConv.otherUser.lastSeen);

  if (authLoading || listLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (createConversation.isPending) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Starting conversation...</p>
      </div>
    );
  }

  if (createConversation.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive">{createConversation.error.message}</p>
        <Button variant="outline" onClick={() => router.push("/")}>
          Go back home
        </Button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex h-full w-full flex-col border-r bg-background md:w-80 lg:w-96",
          conversationId ? "hidden md:flex" : "flex"
        )}
      >
        {/* Sidebar header */}
        <header className="flex h-14 flex-shrink-0 items-center justify-between border-b px-4 sm:h-16">
          <h1 className="text-lg font-semibold">Messages</h1>
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <X className="h-5 w-5" />
            </Link>
          </Button>
        </header>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
              <MessageCircle className="h-12 w-12 text-muted-foreground" />
              <div>
                <h2 className="font-semibold">No conversations yet</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Start by messaging a seller
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/search">Browse listings</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {conversations.map((conv) => {
                const isSelected = conv.id === conversationId;
                const isOnlineUser =
                  conv.otherUser && isOnline(conv.otherUser.lastSeen);

                return (
                  <button
                    key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={cn(
                      "flex w-full gap-3 p-3 text-left transition-colors hover:bg-muted/50 sm:p-4",
                      isSelected && "bg-muted"
                    )}
                  >
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-11 w-11 sm:h-12 sm:w-12">
                        <AvatarImage src={conv.otherUser?.avatar || undefined} />
                        <AvatarFallback>
                          {conv.otherUser?.name?.charAt(0).toUpperCase() || "?"}
                        </AvatarFallback>
                      </Avatar>
                      {isOnlineUser && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 ring-2 ring-background" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-0.5 flex items-center justify-between">
                        <span className="truncate text-sm font-semibold">
                          {conv.otherUser?.name || "Unknown"}
                        </span>
                        <span className="ml-2 flex-shrink-0 text-xs text-muted-foreground">
                          {conv.lastMessage
                            ? formatTime(conv.lastMessage.createdAt)
                            : ""}
                        </span>
                      </div>
                      <p className="mb-0.5 truncate text-xs text-muted-foreground">
                        {conv.listing.title}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm text-muted-foreground">
                          {conv.lastMessage?.content || "No messages yet"}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="ml-2 h-5 min-w-5 justify-center">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Chat area */}
      <main
        className={cn(
          "flex h-full flex-1 flex-col",
          !conversationId ? "hidden md:flex" : "flex"
        )}
      >
        {!conversationId ? (
          // Empty state
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="rounded-full bg-muted p-6">
              <MessageCircle className="h-12 w-12 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Select a conversation</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Choose from your existing conversations
              </p>
            </div>
          </div>
        ) : convLoading ? (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !selectedConv ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
            <p className="text-muted-foreground">Conversation not found</p>
            <Button
              variant="outline"
              onClick={() => router.push("/messages")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to messages
            </Button>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <header className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 md:hidden"
                  onClick={() => router.push("/messages")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="relative flex-shrink-0">
                  <Avatar className="h-9 w-9 sm:h-10 sm:w-10">
                    <AvatarImage
                      src={selectedConv.otherUser?.avatar || undefined}
                    />
                    <AvatarFallback className="text-sm">
                      {selectedConv.otherUser?.name?.charAt(0).toUpperCase() ||
                        "?"}
                    </AvatarFallback>
                  </Avatar>
                  {online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-sm font-semibold sm:text-base">
                    {selectedConv.otherUser?.name || "Unknown"}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {online ? (
                      <span className="text-green-600 dark:text-green-400">
                        Online
                      </span>
                    ) : (
                      "Offline"
                    )}
                  </p>
                </div>

                <Link
                  href={`/listings/${selectedConv.listing.id}`}
                  className="flex items-center gap-2 rounded-lg bg-muted/50 p-1.5 transition-colors hover:bg-muted sm:p-2"
                >
                  {selectedConv.listing.images[0] && (
                    <Image
                      src={selectedConv.listing.images[0].url}
                      alt=""
                      width={36}
                      height={36}
                      className="h-9 w-9 rounded object-cover sm:h-10 sm:w-10"
                    />
                  )}
                  <div className="hidden max-w-[120px] text-right sm:block">
                    <p className="truncate text-xs font-medium">
                      {selectedConv.listing.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ৳{selectedConv.listing.price.toLocaleString()}
                    </p>
                  </div>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 sm:h-10 sm:w-10"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/listings/${selectedConv.listing.id}`}>
                        View listing
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </header>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="space-y-4 p-3 sm:p-4">
                {Object.entries(messagesByDate).map(([dateKey, msgs]) => (
                  <div key={dateKey}>
                    <div className="sticky top-2 z-10 mb-4 flex justify-center">
                      <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground shadow-sm">
                        {formatMessageDate(msgs[0].createdAt)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {msgs.map((msg) => {
                        const isMine = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${
                              isMine ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-3.5 py-2 sm:max-w-[75%] sm:px-4 ${
                                isMine
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                            >
                              <p className="whitespace-pre-wrap break-words text-sm sm:text-base">
                                {msg.content}
                              </p>
                              <p
                                className={`mt-1 text-[10px] sm:text-xs ${
                                  isMine
                                    ? "text-primary-foreground/70"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {formatMessageTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} className="h-1" />
              </div>
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <form
                onSubmit={handleSubmit}
                className="p-3 sm:p-4"
              >
                <div className="flex items-end gap-2">
                  <Textarea
                    ref={textareaRef}
                    value={newMessage}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    disabled={sendMessage.isPending}
                    rows={1}
                    className="max-h-[120px] min-h-[44px] flex-1 resize-none py-3 text-sm sm:text-base"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    className="h-11 w-11 flex-shrink-0 rounded-full"
                  >
                    {sendMessage.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <MessagesContent />
    </Suspense>
  );
}
