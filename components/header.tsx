"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Menu, Plus, Heart, MessageCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/auth-provider";

export default function Header() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Heartbeat to track online status
  useEffect(() => {
    if (!user) return;
    const heartbeat = () => fetch("/api/users/heartbeat", { method: "POST" }).catch(() => {});
    heartbeat();
    const interval = setInterval(heartbeat, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Unread message count
  const { data: unreadData } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      const res = await fetch("/api/conversations/unread");
      if (!res.ok) return { unreadCount: 0 };
      return res.json();
    },
    enabled: !!user,
    refetchInterval: 10000,
  });

  const unreadCount = unreadData?.unreadCount || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-8">
                <Link href="/" className="text-lg font-semibold">
                  Home
                </Link>
                <Link href="/categories" className="text-lg">
                  Categories
                </Link>
                {user && (
                  <>
                    <Link href="/dashboard" className="text-lg">
                      Dashboard
                    </Link>
                    <Link href="/favorites" className="text-lg">
                      Favorites
                    </Link>
                    <Link href="/messages" className="text-lg flex items-center gap-2">
                      Messages
                      {unreadCount > 0 && (
                        <Badge className="h-5 min-w-5 flex items-center justify-center text-xs p-0">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">BeforeSell</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link
              href="/categories"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Categories
            </Link>
          </nav>

          <form onSubmit={handleSearch} className="hidden md:flex items-center ml-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </form>
        </div>

        <div className="flex items-center gap-2">
          {!isLoading && (
            <>
              {user ? (
                <>
                  <Button asChild variant="default" size="sm" className="hidden sm:flex">
                    <Link href="/listings/new">
                      <Plus className="h-4 w-4 mr-1" />
                      Post Ad
                    </Link>
                  </Button>

                  <Button asChild variant="ghost" size="icon" className="hidden sm:flex">
                    <Link href="/favorites">
                      <Heart className="h-5 w-5" />
                    </Link>
                  </Button>

                  <Button asChild variant="ghost" size="icon" className="hidden sm:flex relative">
                    <Link href="/messages">
                      <MessageCircle className="h-5 w-5" />
                      {unreadCount > 0 && (
                        <Badge className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center text-xs p-0">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </Badge>
                      )}
                    </Link>
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatar || undefined} />
                          <AvatarFallback>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-2 py-1.5">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard">Dashboard</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/listings">My Listings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/settings">Settings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout} className="text-red-600">
                        Logout
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Button asChild variant="default" size="icon" className="sm:hidden">
                    <Link href="/listings/new">
                      <Plus className="h-5 w-5" />
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/register">Register</Link>
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}
