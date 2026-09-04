"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  BadgeCheck,
  CalendarDays,
  Clock3,
  Eye,
  ExternalLink,
  Loader2,
  MapPin,
  Megaphone,
  Search,
  ShieldAlert,
  Target,
  UserRound,
  WalletCards,
  XCircle,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { adminQuery } from "@/lib/queries";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PENDING_REVIEW: "border-amber-200 bg-amber-50 text-amber-800",
  PROCESSING: "border-blue-200 bg-blue-50 text-blue-800",
  APPROVED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  REJECTED: "border-red-200 bg-red-50 text-red-800",
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
    <div className="mx-auto max-w-7xl space-y-7">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#276fae]"><Megaphone className="h-4 w-4" />Promotion operations</div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">Boost review queue</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Inspect the audience, gender targeting, spend, and schedule before moving a campaign into processing or approving it.</p>
        </div>
        <Select value={status} onValueChange={(value) => { setStatus(value as PromotionStatus | "ALL"); setPage(1); }}>
          <SelectTrigger className="w-full bg-white sm:w-48"><SelectValue /></SelectTrigger>
          <SelectContent>{statuses.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "In this view", value: pagination?.total ?? 0, icon: Search, tone: "text-slate-700 bg-white" },
          { label: "Awaiting review", value: promotions.filter((item) => item.status === "PENDING_REVIEW").length, icon: Clock3, tone: "text-amber-700 bg-amber-50" },
          { label: "Processing", value: promotions.filter((item) => item.status === "PROCESSING").length, icon: Loader2, tone: "text-blue-700 bg-blue-50" },
          { label: "Approved", value: promotions.filter((item) => item.status === "APPROVED").length, icon: BadgeCheck, tone: "text-emerald-700 bg-emerald-50" },
        ].map((item) => (
          <div key={item.label} className={cn("border border-slate-200 p-4", item.tone)}>
            <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider opacity-75">{item.label}</p><item.icon className="h-4 w-4" /></div>
            <p className="mt-2 text-2xl font-bold">{item.value}</p>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-80 items-center justify-center border border-slate-200 bg-white"><Loader2 className="mr-2 animate-spin text-[#276fae]" /> Loading promotion requests…</div>
      ) : promotions.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center border border-dashed border-slate-300 bg-white p-8 text-center">
          <Megaphone className="h-10 w-10 text-slate-300" />
          <h2 className="mt-4 text-lg font-bold">No promotion requests here</h2>
          <p className="mt-1 text-sm text-slate-500">New listing boosts will appear in this queue.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {promotions.map((promotion) => (
            <article key={promotion.id} id={`promotion-${promotion.id}`} className="border border-slate-200 bg-white shadow-[0_12px_40px_rgba(30,64,105,0.06)]">
              <div className="grid lg:grid-cols-[260px_minmax(0,1fr)]">
                <div className="relative min-h-56 border-b border-slate-200 bg-slate-100 lg:min-h-full lg:border-b-0 lg:border-r">
                  {promotion.listing.images[0]?.url ? (
                    <Image src={promotion.listing.images[0].url} alt={promotion.listing.title} fill unoptimized className="object-cover" sizes="260px" />
                  ) : (
                    <div className="flex h-full min-h-56 items-center justify-center text-sm text-slate-400">No listing image</div>
                  )}
                  <Badge className={cn("absolute left-4 top-4 border shadow-sm", statusStyles[promotion.status])} variant="outline">{formatStatus(promotion.status)}</Badge>
                </div>

                <div>
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#2d74b4]">{promotion.listing.category?.name ?? "Marketplace"}</p>
                      <h2 className="mt-1 truncate text-xl font-bold text-slate-950">{promotion.listing.title}</h2>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><UserRound className="h-3.5 w-3.5" />{promotion.user.name} · {promotion.user.email}</span>
                        <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Submitted {new Date(promotion.submittedAt).toLocaleString("en-BD")}</span>
                      </div>
                    </div>
                    <Button asChild variant="outline" size="sm" className="shrink-0"><Link href={`/listings/${promotion.listing.id}`} target="_blank">View listing <ExternalLink /></Link></Button>
                  </div>

                  <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                    <div className="p-5"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Target className="h-3.5 w-3.5" />Audience</p><p className="mt-3 font-semibold">{promotion.audienceType === "AUTOMATIC" ? "Smart audience" : `Ages ${promotion.minAge}–${promotion.maxAge}`}</p><p className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin className="h-3.5 w-3.5" />{promotion.location}</p><p className="mt-1 text-sm text-slate-500">Gender: {promotion.gender === "BOTH" ? "Both" : promotion.gender === "MALE" ? "Male" : "Female"}</p></div>
                    <div className="p-5"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><CalendarDays className="h-3.5 w-3.5" />Schedule</p><p className="mt-3 font-semibold">{promotion.durationDays} days</p><p className="mt-1 text-sm text-slate-500">Starts {new Date(promotion.startDate).toLocaleDateString("en-BD")}</p></div>
                    <div className="p-5"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><WalletCards className="h-3.5 w-3.5" />Budget</p><p className="mt-3 font-semibold">৳{formatNumber(promotion.totalBudget)} total</p><p className="mt-1 text-sm text-slate-500">৳{formatNumber(promotion.dailyBudget)} per day</p></div>
                    <div className="p-5"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400"><Eye className="h-3.5 w-3.5" />Daily estimate</p><p className="mt-3 font-semibold">{formatNumber(promotion.estimatedMinReach)}–{formatNumber(promotion.estimatedMaxReach)}</p><p className="mt-1 text-sm text-slate-500">potential views</p></div>
                  </div>

                  <div className="grid gap-5 border-t border-slate-100 p-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Review snapshot</p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          Promoting to {promotion.gender === "BOTH" ? "all buyers" : promotion.gender === "MALE" ? "male buyers" : "female buyers"} in {promotion.location}, with a total budget of ৳{formatNumber(promotion.totalBudget)}.
                        </p>
                      </div>
                      {promotion.reviewedBy ? <p className="text-xs text-slate-400">Last reviewed by {promotion.reviewedBy.name}{promotion.reviewedAt ? ` on ${new Date(promotion.reviewedAt).toLocaleString("en-BD")}` : ""}</p> : null}
                    </div>
                    <div>
                      <Textarea
                        aria-label={`Review note for ${promotion.listing.title}`}
                        placeholder="Optional review note…"
                        rows={3}
                        value={notes[promotion.id] ?? promotion.reviewNote ?? ""}
                        onChange={(event) => setNotes((current) => ({ ...current, [promotion.id]: event.target.value }))}
                      />
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button type="button" variant="outline" disabled={updatePromotion.isPending} onClick={() => updatePromotion.mutate({ id: promotion.id, nextStatus: "PROCESSING" })}><Clock3 />Processing</Button>
                        <Button type="button" className="bg-emerald-700 hover:bg-emerald-800" disabled={updatePromotion.isPending} onClick={() => updatePromotion.mutate({ id: promotion.id, nextStatus: "APPROVED" })}><BadgeCheck />Approve</Button>
                        <Button type="button" variant="outline" className="col-span-2 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" disabled={updatePromotion.isPending} onClick={() => updatePromotion.mutate({ id: promotion.id, nextStatus: "REJECTED" })}><XCircle />Reject request</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between border-t border-slate-200 pt-5">
          <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.totalPages}</p>
          <div className="flex gap-2"><Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="outline" disabled={page >= pagination.totalPages} onClick={() => setPage((value) => value + 1)}>Next</Button></div>
        </div>
      ) : null}

      <div className="flex items-start gap-3 border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
        Approval changes the campaign workflow status. Billing and campaign delivery remain manual until a payment provider and ad-delivery service are connected.
      </div>
    </div>
  );
}
