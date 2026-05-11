"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Menu, Plus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { conversationsQuery } from "@/lib/queries";


export function Header() {
  const { user, isLoading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const authKey = user?.id;

  const { data: unreadData } = useQuery(conversationsQuery(authKey).unreadCount());
  const unreadCount = unreadData?.unreadCount || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="flex flex-col gap-4 mt-8 px-6">
                <Link href="/" className="text-lg font-semibold" onClick={() => setSidebarOpen(false)}>
                  Home
                </Link>
                <Link href="/search" className="text-lg" onClick={() => setSidebarOpen(false)}>
                  Categories
                </Link>
                {user && (
                  <>
                    <Link href="/dashboard" className="text-lg" onClick={() => setSidebarOpen(false)}>
                      Dashboard
                    </Link>
                    <Link href="/messages" className="text-lg flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
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
            <Image src="/logo.svg" alt="BeforeSell" width={32} height={32} className="h-8 w-8" />
            <span className="text-xl font-bold text-primary hidden sm:inline">BeforeSell</span>
          </Link>

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
