"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Loader2,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type PromotionStatus = "PENDING_REVIEW" | "PROCESSING" | "APPROVED" | "REJECTED";
type Gender = "BOTH" | "MALE" | "FEMALE";

interface BoostListingFormProps {
  listing: {
    id: string;
    slug: string;
    title: string;
    price: number;
    category: string;
    images: string[];
  };
  latestPromotion: {
    id: string;
    status: PromotionStatus;
    totalBudget: number;
    durationDays: number;
    submittedAt: string;
    reviewedAt: string | null;
    reviewNote: string | null;
  } | null;
}

const locations = [
  "Bangladesh",
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Barishal",
  "Rangpur",
  "Mymensingh",
];

const statusContent: Record<PromotionStatus, { label: string; message: string; color: string }> = {
  PENDING_REVIEW: {
    label: "Pending review",
    message: "Your promotion is safely in the review queue. An administrator will check the campaign details shortly.",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  PROCESSING: {
    label: "Processing",
    message: "The BeforeSell team is preparing your promotion and checking placement availability.",
    color: "bg-blue-50 text-blue-800 border-blue-200",
  },
  APPROVED: {
    label: "Approved",
    message: "Your campaign is approved. Your listing will be promoted according to the submitted schedule.",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  REJECTED: {
    label: "Needs changes",
    message: "This request needs an update before it can run. Review the note below and submit a new campaign.",
    color: "bg-red-50 text-red-800 border-red-200",
  },
};

function localDateValue(date: Date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-BD", { maximumFractionDigits: 0 }).format(value);
}

export function BoostListingForm({ listing, latestPromotion }: BoostListingFormProps) {
  const router = useRouter();
  const [submittedPromotion, setSubmittedPromotion] = useState(latestPromotion);
  const [audienceType, setAudienceType] = useState<"AUTOMATIC" | "CUSTOM">("AUTOMATIC");
  const [location, setLocation] = useState("Bangladesh");
  const [minAge, setMinAge] = useState(18);
  const [maxAge, setMaxAge] = useState(40);
  const [startDate, setStartDate] = useState(() => localDateValue(new Date()));
  const [durationDays, setDurationDays] = useState(3);
  const [dailyBudget, setDailyBudget] = useState(150);
  const [gender, setGender] = useState<Gender>("BOTH");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalBudget = dailyBudget * durationDays;
  const estimatedMinReach = Math.round(dailyBudget * 6.5);
  const estimatedMaxReach = Math.round(dailyBudget * 20);
  const endDate = new Date(`${startDate}T00:00:00`);
  endDate.setDate(endDate.getDate() + durationDays);

  const activePromotion = submittedPromotion?.status !== "REJECTED" ? submittedPromotion : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);
    try {
      const response = await api("listings/[id]/promotions", {
        method: "POST",
        params: { id: listing.id },
        body: {
          audienceType,
          location,
          minAge,
          maxAge,
          startDate,
          durationDays,
          dailyBudget,
          gender,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(
          "error" in result && typeof result.error === "string"
            ? result.error
            : "Could not submit promotion",
        );
      }

      setSubmittedPromotion({
        id: result.promotion.id,
        status: result.promotion.status,
        totalBudget: result.promotion.totalBudget,
        durationDays: result.promotion.durationDays,
        submittedAt: new Date(result.promotion.submittedAt).toISOString(),
        reviewedAt: result.promotion.reviewedAt
          ? new Date(result.promotion.reviewedAt).toISOString()
          : null,
        reviewNote: result.promotion.reviewNote,
      });
      toast.success(
        result.emailSent
          ? "Submitted for review and the admin was notified"
          : "Submitted for review; email delivery will be retried by the team",
      );
      router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit promotion");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (activePromotion) {
    const current = statusContent[activePromotion.status];
    return (
      <main className="min-h-[calc(100vh-4rem)] bg-[#f4f7fb] px-4 py-10 sm:py-16">
        <div className="mx-auto max-w-2xl border border-slate-200 bg-white">
          {/* <div className="h-1.5 bg-gradient-to-r from-[#163f68] via-[#2f83d8] to-[#6bbcf8]" /> */}
          <div className="p-7 sm:p-12">
            <div className="mb-8 flex h-16 w-16 items-center justify-center bg-[#eaf4ff] text-[#1f67a9]">
              {activePromotion.status === "APPROVED" ? (
                <BadgeCheck className="h-8 w-8" />
              ) : (
                <Clock3 className="h-8 w-8" />
              )}
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2f72ad]">Promotion request</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Your boost is in motion.</h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">{current.message}</p>

            <div className={cn("mt-7 inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold", current.color)}>
              <span className="h-2 w-2 animate-pulse bg-current" />
              {current.label}
            </div>

            <div className="mt-8 grid border-y border-slate-200 sm:grid-cols-3">
              <div className="border-b border-slate-200 py-5 sm:border-b-0 sm:border-r sm:px-5 sm:first:pl-0">
                <p className="text-xs uppercase tracking-wider text-slate-500">Listing</p>
                <p className="mt-1 truncate font-semibold text-slate-900">{listing.title}</p>
              </div>
              <div className="border-b border-slate-200 py-5 sm:border-b-0 sm:border-r sm:px-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">Duration</p>
                <p className="mt-1 font-semibold text-slate-900">{activePromotion.durationDays} days</p>
              </div>
              <div className="py-5 sm:pl-5">
                <p className="text-xs uppercase tracking-wider text-slate-500">Budget</p>
                <p className="mt-1 font-semibold text-slate-900">৳{formatNumber(activePromotion.totalBudget)}</p>
              </div>
            </div>

            {activePromotion.reviewNote ? (
              <div className="mt-7 border-l-4 border-amber-400 bg-amber-50 p-4">
                <p className="text-sm font-semibold text-amber-950">Reviewer note</p>
                <p className="mt-1 text-sm leading-6 text-amber-900">{activePromotion.reviewNote}</p>
              </div>
            ) : null}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={`/listings/${listing.slug}`}>Back to listing</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard/listings">My listings</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f2f5f9] text-slate-950">
      <div className="border-b border-slate-200 bg-white">
        <div className="container flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" aria-label="Back to listing">
              <Link href={`/listings/${listing.slug}`}><ArrowLeft /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#2d74b4]" />
                <h1 className="text-xl font-bold tracking-tight">Boost your listing</h1>
              </div>
              <p className="mt-0.5 text-sm text-slate-500">Create a focused campaign in a few minutes</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm font-medium text-slate-500 sm:flex">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Reviewed by BeforeSell
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container grid gap-7 px-4 py-7 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          {submittedPromotion?.status === "REJECTED" ? (
            <section className="border border-red-200 bg-red-50 p-5">
              <p className="font-semibold text-red-950">Your previous request needs changes</p>
              <p className="mt-1 text-sm leading-6 text-red-800">
                {submittedPromotion.reviewNote || "Please review your campaign details and submit again."}
              </p>
            </section>
          ) : null}

          <section className="border border-slate-200 bg-white shadow-[0_10px_35px_rgba(30,64,105,0.05)]">
            <div className="flex items-start gap-4 border-b border-slate-100 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#eaf4ff] text-[#226aa8]"><Target /></div>
              <div>
                <h2 className="text-lg font-bold">Audience</h2>
                <p className="text-sm text-slate-500">Choose who is most likely to respond to your listing.</p>
              </div>
            </div>
            <div className="space-y-4 p-6">
              <button
                type="button"
                onClick={() => setAudienceType("AUTOMATIC")}
                className={cn(
                  "flex w-full items-start justify-between border p-5 text-left transition",
                  audienceType === "AUTOMATIC" ? "border-[#2d74b4] bg-[#f3f8fd] ring-1 ring-[#2d74b4]" : "border-slate-200 hover:border-slate-400",
                )}
              >
                <span>
                  <span className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-[#2d74b4]" />Smart audience</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-500">BeforeSell automatically finds people likely to be interested.</span>
                </span>
                <span className={cn("mt-1 flex h-5 w-5 items-center justify-center border", audienceType === "AUTOMATIC" ? "border-[#2d74b4] bg-[#2d74b4] text-white" : "border-slate-300")}>
                  {audienceType === "AUTOMATIC" ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAudienceType("CUSTOM")}
                className={cn(
                  "flex w-full items-start justify-between border p-5 text-left transition",
                  audienceType === "CUSTOM" ? "border-[#2d74b4] bg-[#f3f8fd] ring-1 ring-[#2d74b4]" : "border-slate-200 hover:border-slate-400",
                )}
              >
                <span>
                  <span className="font-semibold">People you choose</span>
                  <span className="mt-1 block text-sm leading-6 text-slate-500">Set a location and age range manually.</span>
                </span>
                <span className={cn("mt-1 flex h-5 w-5 items-center justify-center border", audienceType === "CUSTOM" ? "border-[#2d74b4] bg-[#2d74b4] text-white" : "border-slate-300")}>
                  {audienceType === "CUSTOM" ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
              </button>

              <div className="grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>{locations.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min-age">Minimum age</Label>
                  <Input id="min-age" type="number" min={18} max={65} value={minAge} onChange={(event) => setMinAge(Number(event.target.value))} disabled={audienceType === "AUTOMATIC"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-age">Maximum age</Label>
                  <Input id="max-age" type="number" min={18} max={65} value={maxAge} onChange={(event) => setMaxAge(Number(event.target.value))} disabled={audienceType === "AUTOMATIC"} />
                </div>
                <div className="space-y-2">
                  <Label>Gender</Label>
                  <Select value={gender} onValueChange={(value) => setGender(value as Gender)}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BOTH">Both</SelectItem>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </section>

          <section className="border border-slate-200 bg-white shadow-[0_10px_35px_rgba(30,64,105,0.05)]">
            <div className="flex items-start gap-4 border-b border-slate-100 p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-[#eaf4ff] text-[#226aa8]"><CalendarDays /></div>
              <div><h2 className="text-lg font-bold">Schedule and budget</h2><p className="text-sm text-slate-500">Control when your campaign runs and how much you spend.</p></div>
            </div>
            <div className="space-y-7 p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start date</Label>
                  <Input id="start-date" type="date" min={localDateValue(new Date())} value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <div className="flex h-9 border border-slate-200">
                    <button type="button" className="w-10 text-xl text-slate-500 hover:bg-slate-50" onClick={() => setDurationDays((value) => Math.max(1, value - 1))} aria-label="Decrease duration">−</button>
                    <Input id="duration" className="h-full border-y-0 text-center" type="number" min={1} max={30} value={durationDays} onChange={(event) => setDurationDays(Math.min(30, Math.max(1, Number(event.target.value))))} />
                    <button type="button" className="w-10 text-xl text-slate-500 hover:bg-slate-50" onClick={() => setDurationDays((value) => Math.min(30, value + 1))} aria-label="Increase duration">+</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <div className="flex h-9 items-center border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
                    {endDate.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div><Label htmlFor="daily-budget" className="text-base font-bold">Daily budget</Label><p className="mt-1 text-sm text-slate-500">Minimum ৳100 per day</p></div>
                  <div className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-[#245f94]">৳</span>
                    <Input id="daily-budget" className="pl-8 text-right text-lg font-bold text-[#245f94]" type="number" min={100} max={5000} value={dailyBudget} onChange={(event) => setDailyBudget(Math.min(5000, Math.max(100, Number(event.target.value))))} />
                  </div>
                </div>
                <input aria-label="Daily budget" className="boost-range w-full" type="range" min={100} max={5000} step={50} value={dailyBudget} onChange={(event) => setDailyBudget(Number(event.target.value))} />
                <div className="mt-1 flex justify-between text-xs text-slate-400"><span>৳100</span><span>৳5,000</span></div>
                <div className="mt-5 border-l-4 border-[#3c8dd1] bg-[#eef7ff] px-4 py-3">
                  <p className="text-sm text-[#173f67]">Estimated <strong>{formatNumber(estimatedMinReach)}–{formatNumber(estimatedMaxReach)} views per day</strong> based on this budget.</p>
                </div>
              </div>
            </div>
          </section>

        </div>

        <aside className="self-start space-y-5 xl:sticky xl:top-24">
          <section className="border border-slate-200 bg-white shadow-[0_18px_55px_rgba(30,64,105,0.10)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="font-bold">Ad preview</h2><span className="text-xs font-semibold uppercase tracking-wider text-[#2d74b4]">Live preview</span></div>
            <div className="p-5">
              <div className="overflow-hidden border border-slate-200 bg-white shadow-sm">
                <div className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 items-center justify-center bg-[#173f67] font-bold text-white">B</div>
                  <div><p className="text-sm font-bold">BeforeSell</p><p className="text-[11px] text-slate-500">Sponsored · {location}</p></div>
                </div>
                <p className="min-h-16 px-3 pb-3 text-sm leading-5 text-slate-700">A great deal is waiting. Check out {listing.title} on BeforeSell today.</p>
                <div className="relative aspect-[4/3] bg-slate-100">
                  {listing.images[0] ? <Image src={listing.images[0]} alt={listing.title} fill unoptimized className="object-cover" sizes="360px" /> : <div className="flex h-full items-center justify-center text-sm text-slate-400">Listing image</div>}
                  <div className="absolute left-3 top-3 bg-white/95 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#173f67] shadow">Featured</div>
                </div>
                <div className="flex items-center justify-between gap-3 bg-slate-50 p-3">
                  <div className="min-w-0"><p className="text-[10px] uppercase tracking-wider text-slate-500">{listing.category}</p><p className="truncate text-sm font-bold">{listing.title}</p><p className="text-sm font-bold text-[#245f94]">৳{formatNumber(listing.price)}</p></div>
                  <span className="flex shrink-0 items-center gap-1 bg-[#173f67] px-3 py-2 text-xs font-semibold text-white"><MessageCircle className="h-3.5 w-3.5" />Message</span>
                </div>
              </div>
            </div>
          </section>

          <section className="border border-slate-200 bg-white p-5 shadow-[0_18px_55px_rgba(30,64,105,0.08)]">
            <div className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-[#2d74b4]" /><h2 className="font-bold">Campaign summary</h2></div>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Daily budget</dt><dd className="font-semibold">৳{formatNumber(dailyBudget)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Duration</dt><dd className="font-semibold">{durationDays} days</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Audience</dt><dd className="text-right font-semibold">{audienceType === "AUTOMATIC" ? "Smart" : `${minAge}–${maxAge}`}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-slate-500">Gender</dt><dd className="font-semibold">{gender === "BOTH" ? "Both" : gender === "MALE" ? "Male" : "Female"}</dd></div>
              <div className="border-t border-slate-200 pt-4"><div className="flex items-end justify-between"><dt className="font-semibold">Total budget</dt><dd className="text-2xl font-bold text-[#1c5688]">৳{formatNumber(totalBudget)}</dd></div><p className="mt-1 text-right text-xs text-slate-400">Final billing is arranged after approval</p></div>
            </dl>
            <Button type="submit" size="lg" className="mt-6 h-12 w-full bg-[#173f67] text-base hover:bg-[#0f3152]" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
              {isSubmitting ? "Submitting…" : "Submit for review"}
              {isSubmitting ? null : <ChevronRight className="ml-auto" />}
            </Button>
            <p className="mt-4 text-center text-xs leading-5 text-slate-500">By submitting, you confirm that this ad accurately represents your listing.</p>
          </section>
        </aside>
      </form>
    </main>
  );
}
