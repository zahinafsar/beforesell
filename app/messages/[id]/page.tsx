"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

interface ConversationData {
  conversation: {
    id: string;
    listing: {
      id: string;
      title: string;
      price: number;
      images: { url: string }[];
    };
    otherUser: {
      id: string;
      name: string;
      avatar: string | null;
      lastSeen: string;
    };
  };
  messages: Message[];
}

function isOnline(lastSeen: string): boolean {
  return new Date(lastSeen).getTime() > Date.now() - 5 * 60 * 1000;
}

function formatMessageTime(date: string): string {
  const d = new Date(date);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatMessageDate(date: string): string {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

export default function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageTime = useRef<string | null>(null);

  const { data, isLoading, refetch } = useQuery<ConversationData>({
    queryKey: ["conversation", id],
    queryFn: async () => {
      const url = lastMessageTime.current
        ? `/api/conversations/${id}?after=${encodeURIComponent(lastMessageTime.current)}`
        : `/api/conversations/${id}`;
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) throw new Error("Conversation not found");
        throw new Error("Failed to fetch");
      }
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 2000,
  });

  const sendMessage = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to send");
      return res.json();
    },
    onSuccess: () => {
      setNewMessage("");
      refetch();
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  useEffect(() => {
    if (data?.messages?.length) {
      const lastMsg = data.messages[data.messages.length - 1];
      lastMessageTime.current = lastMsg.createdAt;
    }
  }, [data?.messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && !sendMessage.isPending) {
      sendMessage.mutate(newMessage.trim());
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data?.conversation) {
    return (
      <div className="container py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Conversation not found</p>
            <Link href="/messages" className="text-primary hover:underline text-sm mt-2 block">
              Back to messages
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { conversation, messages } = data;
  const online = conversation.otherUser && isOnline(conversation.otherUser.lastSeen);

  // Group messages by date
  const messagesByDate: Record<string, Message[]> = {};
  messages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!messagesByDate[dateKey]) messagesByDate[dateKey] = [];
    messagesByDate[dateKey].push(msg);
  });

  return (
    <div className="container py-4 max-w-3xl">
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        {/* Header */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push("/messages")}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={conversation.otherUser?.avatar || undefined} />
                  <AvatarFallback>
                    {conversation.otherUser?.name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                {online && (
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold truncate">
                  {conversation.otherUser?.name || "Unknown"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {online ? "Online" : "Offline"}
                </p>
              </div>
              <Link href={`/listings/${conversation.listing.id}`}>
                <div className="flex items-center gap-2 p-2 bg-accent rounded-lg hover:bg-accent/80 transition-colors">
                  {conversation.listing.images[0] && (
                    <Image
                      src={conversation.listing.images[0].url}
                      alt=""
                      width={40}
                      height={40}
                      className="h-10 w-10 object-cover rounded"
                    />
                  )}
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium truncate max-w-32">
                      {conversation.listing.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ৳{conversation.listing.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 px-2">
          {Object.entries(messagesByDate).map(([dateKey, msgs]) => (
            <div key={dateKey}>
              <div className="flex justify-center mb-4">
                <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
                  {formatMessageDate(msgs[0].createdAt)}
                </span>
              </div>
              <div className="space-y-2">
                {msgs.map((msg) => {
                  const isMine = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          isMine
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMine ? "text-primary-foreground/70" : "text-muted-foreground"
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
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              disabled={sendMessage.isPending}
              className="flex-1"
            />
            <Button type="submit" disabled={!newMessage.trim() || sendMessage.isPending}>
              {sendMessage.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
