"use client";

import Link from "next/link";
import { Menu, Plus, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
                    <Link href="/messages" className="text-lg">
                      Messages
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

                  <Button asChild variant="ghost" size="icon" className="hidden sm:flex">
                    <Link href="/messages">
                      <MessageCircle className="h-5 w-5" />
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
