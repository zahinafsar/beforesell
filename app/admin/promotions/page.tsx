"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BadgeCheck,
  Clock3,
  Eye,
  ExternalLink,
  Loader2,
  Megaphone,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { adminQuery } from "@/lib/queries";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type PromotionStatus = "PENDING_REVIEW" | "PROCESSING" | "APPROVED" | "REJECTED";

const statuses: Array<{ value: PromotionStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All requests" },
  { value: "PENDING_REVIEW", label: "Pending review" },
  { value: "PROCESSING", label: "Processing" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const statusStyles: Record<PromotionStatus, string> = {
  PENDING_REVIEW: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  PROCESSING: "border-primary/30 bg-primary/10 text-primary",
  APPROVED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  REJECTED: "border-destructive/30 bg-destructive/10 text-destructive",
};

function formatStatus(status: PromotionStatus) {
  return status.toLowerCase().split("_").map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(value);
}

export default function AdminPromotionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<PromotionStatus | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery(
    adminQuery(user?.id).promotions({
      page,
      limit: 12,
      status: status === "ALL" ? undefined : status,
    }),
  );

  const updatePromotion = useMutation({
    mutationFn: async ({
      id,
      nextStatus,
    }: {
      id: string;
      nextStatus: PromotionStatus;
    }) => {
      const response = await api("admin/promotions/[id]", {
        method: "PUT",
        params: { id },
        body: { status: nextStatus, reviewNote: notes[id]?.trim() || undefined },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          "error" in result && typeof result.error === "string"
            ? result.error
            : "Could not update promotion",
        );
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "promotions"] });
      toast.success("Promotion status updated");
    },
    onError: (error) => toast.error(error.message),
  });

  const promotions = data?.promotions ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Promotions</h1>

      <Select value={status} onValueChange={(value) => { setStatus(value as PromotionStatus | "ALL"); setPage(1); }}>
        <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
        <SelectContent>{statuses.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
      </Select>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Promotion Requests {pagination && `(${pagination.total})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground"><Loader2 className="mr-2 animate-spin" />Loading...</div>
          ) : promotions.length === 0 ? (
            <div className="flex flex-col items-center justify-center border border-dashed py-12 text-center">
              <Megaphone className="h-10 w-10 text-muted-foreground" />
              <h2 className="mt-4 font-semibold">No promotion requests</h2>
              <p className="mt-1 text-sm text-muted-foreground">New listing boosts will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>Seller</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((promotion) => (
                  <TableRow key={promotion.id} id={`promotion-${promotion.id}`}>
                    <TableCell>
                      <div className="flex min-w-52 items-center gap-3">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-muted">
                          {promotion.listing.images[0]?.url ? (
                            <Image src={promotion.listing.images[0].url} alt={promotion.listing.title} fill unoptimized className="object-cover" sizes="48px" />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-48 truncate font-medium">{promotion.listing.title}</p>
                          <p className="text-xs text-muted-foreground">{promotion.listing.category?.name ?? "Marketplace"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{promotion.user.name}</p>
                      <p className="text-xs text-muted-foreground">{promotion.user.email}</p>
                    </TableCell>
                    <TableCell>
                      <p>{promotion.audienceType === "AUTOMATIC" ? "Smart" : `${promotion.minAge}–${promotion.maxAge}`}</p>
                      <p className="text-xs text-muted-foreground">{promotion.location}</p>
                    </TableCell>
                    <TableCell>
                      <p>{promotion.durationDays} days</p>
                      <p className="text-xs text-muted-foreground">{new Date(promotion.startDate).toLocaleDateString("en-BD")}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">৳{formatNumber(promotion.totalBudget)}</p>
                      <p className="text-xs text-muted-foreground">৳{formatNumber(promotion.dailyBudget)}/day</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn("border", statusStyles[promotion.status])} variant="outline">{formatStatus(promotion.status)}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(promotion.submittedAt).toLocaleDateString("en-BD")}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title="View listing">
                          <Link href={`/listings/${promotion.listing.slug}`} target="_blank"><ExternalLink /></Link>
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm"><Eye />Review</Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{promotion.listing.title}</DialogTitle>
                              <DialogDescription>
                                Submitted by {promotion.user.name} on {new Date(promotion.submittedAt).toLocaleString("en-BD")}
                              </DialogDescription>
                            </DialogHeader>

                            <div className="grid gap-4 border-y py-4 sm:grid-cols-2">
                              <div><p className="text-xs text-muted-foreground">Audience</p><p className="mt-1 text-sm font-medium">{promotion.audienceType === "AUTOMATIC" ? "Smart audience" : `Ages ${promotion.minAge}–${promotion.maxAge}`}</p><p className="text-xs text-muted-foreground">{promotion.location} · {promotion.gender === "BOTH" ? "Both" : promotion.gender === "MALE" ? "Male" : "Female"}</p></div>
                              <div><p className="text-xs text-muted-foreground">Schedule</p><p className="mt-1 text-sm font-medium">{promotion.durationDays} days from {new Date(promotion.startDate).toLocaleDateString("en-BD")}</p></div>
                              <div><p className="text-xs text-muted-foreground">Budget</p><p className="mt-1 text-sm font-medium">৳{formatNumber(promotion.totalBudget)} total</p><p className="text-xs text-muted-foreground">৳{formatNumber(promotion.dailyBudget)} per day</p></div>
                              <div><p className="text-xs text-muted-foreground">Estimated daily views</p><p className="mt-1 text-sm font-medium">{formatNumber(promotion.estimatedMinReach)}–{formatNumber(promotion.estimatedMaxReach)}</p></div>
                            </div>

                            <Textarea
                              aria-label={`Review note for ${promotion.listing.title}`}
                              placeholder="Optional review note..."
                              rows={4}
                              value={notes[promotion.id] ?? promotion.reviewNote ?? ""}
                              onChange={(event) => setNotes((current) => ({ ...current, [promotion.id]: event.target.value }))}
                            />

                            {promotion.reviewedBy ? (
                              <p className="text-xs text-muted-foreground">Last reviewed by {promotion.reviewedBy.name}{promotion.reviewedAt ? ` on ${new Date(promotion.reviewedAt).toLocaleString("en-BD")}` : ""}</p>
                            ) : null}

                            <DialogFooter className="sm:justify-between">
                              <Button type="button" variant="outline" className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive" disabled={updatePromotion.isPending} onClick={() => updatePromotion.mutate({ id: promotion.id, nextStatus: "REJECTED" })}><XCircle />Reject</Button>
                              <div className="flex gap-2">
                                <Button type="button" variant="secondary" disabled={updatePromotion.isPending} onClick={() => updatePromotion.mutate({ id: promotion.id, nextStatus: "PROCESSING" })}><Clock3 />Processing</Button>
                                <Button type="button" disabled={updatePromotion.isPending} onClick={() => updatePromotion.mutate({ id: promotion.id, nextStatus: "APPROVED" })}><BadgeCheck />Approve</Button>
                              </div>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {pagination && pagination.totalPages > 1 ? (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">Page {pagination.page} of {pagination.totalPages}</p>
              <div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 border border-primary/20 bg-primary/5 p-4 text-sm leading-6">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
        Approval changes the campaign workflow status. Billing and campaign delivery remain manual until a payment provider and ad-delivery service are connected.
      </div>
    </div>
  );
}
