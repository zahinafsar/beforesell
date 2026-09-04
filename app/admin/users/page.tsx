"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminQuery } from "@/lib/queries";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Ban,
  CheckCircle,
  MoreHorizontal,
  Search,
  Shield,
  ShieldOff,
  UserRoundCheck,
  XCircle,
} from "lucide-react";

interface UserUpdate {
  role?: "USER" | "ADMIN";
  verified?: boolean;
  blocked?: boolean;
}

interface PendingAction {
  id: string;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  data: UserUpdate;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null,
  );

  const { data, isLoading } = useQuery(
    adminQuery(user?.id).users({ page, limit: 20, search }),
  );

  const updateUser = useMutation({
    mutationFn: async ({
      id,
      data: updateData,
    }: {
      id: string;
      data: UserUpdate;
    }) => {
      const res = await api("admin/users/[id]", {
        method: "PUT",
        params: { id },
        body: updateData,
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: string };
        throw new Error(err.error || "Failed to update user");
      }
      return res.json();
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      if (variables.data.blocked === true) {
        toast.success("User blocked and listings moved to drafts");
        return;
      }
      if (variables.data.blocked === false) {
        toast.success("User unblocked");
        return;
      }
      toast.success("User updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const users = data?.users ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Users</h1>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            All Users {pagination && `(${pagination.total})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground py-8 text-center">Loading...</p>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Listings</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-12 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={u.role === "ADMIN" ? "default" : "secondary"}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {u.verified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-400" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={u.blocked ? "destructive" : "outline"}>
                          {u.blocked ? "Blocked" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell>{u._count.listings}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Actions for ${u.name}`}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              disabled={u.id === user?.id}
                              onSelect={() =>
                                setPendingAction({
                                  id: u.id,
                                  title:
                                    u.role === "ADMIN"
                                      ? "Revoke admin access?"
                                      : "Grant admin access?",
                                  description:
                                    u.role === "ADMIN"
                                      ? `Remove admin privileges from ${u.name}?`
                                      : `Grant admin privileges to ${u.name}?`,
                                  confirmLabel:
                                    u.role === "ADMIN"
                                      ? "Revoke admin"
                                      : "Make admin",
                                  data: {
                                    role:
                                      u.role === "ADMIN" ? "USER" : "ADMIN",
                                  },
                                })
                              }
                            >
                              {u.role === "ADMIN" ? <ShieldOff /> : <Shield />}
                              {u.role === "ADMIN"
                                ? "Revoke admin"
                                : "Make admin"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                updateUser.mutate({
                                  id: u.id,
                                  data: { verified: !u.verified },
                                })
                              }
                            >
                              {u.verified ? <XCircle /> : <CheckCircle />}
                              {u.verified ? "Remove verification" : "Verify user"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant={u.blocked ? "default" : "destructive"}
                              disabled={u.id === user?.id}
                              onSelect={() =>
                                setPendingAction({
                                  id: u.id,
                                  title: u.blocked
                                    ? `Unblock ${u.name}?`
                                    : `Block ${u.name}?`,
                                  description: u.blocked
                                    ? "This restores account access. Their draft listings will remain unpublished."
                                    : "This blocks account access and moves all non-deleted listings to drafts. Unblocking will not republish them.",
                                  confirmLabel: u.blocked
                                    ? "Unblock user"
                                    : "Block user",
                                  destructive: !u.blocked,
                                  data: { blocked: !u.blocked },
                                })
                              }
                            >
                              {u.blocked ? <UserRoundCheck /> : <Ban />}
                              {u.blocked ? "Unblock user" : "Block user"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= pagination.totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={pendingAction !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{pendingAction?.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={pendingAction?.destructive ? "destructive" : "default"}
              disabled={updateUser.isPending}
              onClick={() => {
                if (!pendingAction) return;
                updateUser.mutate({
                  id: pendingAction.id,
                  data: pendingAction.data,
                });
                setPendingAction(null);
              }}
            >
              {pendingAction?.confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
