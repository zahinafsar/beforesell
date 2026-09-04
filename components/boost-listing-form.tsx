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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    color: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  },
  PROCESSING: {
    label: "Processing",
    message: "The BeforeSell team is preparing your promotion and checking placement availability.",
    color: "border-primary/30 bg-primary/10 text-primary",
  },
  APPROVED: {
    label: "Approved",
    message: "Your campaign is approved. Your listing will be promoted according to the submitted schedule.",
    color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  },
  REJECTED: {
    label: "Needs changes",
    message: "This request needs an update before it can run. Review the note below and submit a new campaign.",
    color: "border-destructive/30 bg-destructive/10 text-destructive",
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

  if (!activePromotion) {
    const current = statusContent[activePromotion.status];
    return (
      <main className="container max-w-2xl px-4 py-8 sm:py-12">
        <Card>
          <CardHeader className="gap-5">
            <div className="flex h-14 w-14 items-center justify-center bg-primary/10 text-primary">
              {activePromotion.status === "APPROVED" ? (
                <BadgeCheck className="h-7 w-7" />
              ) : (
                <Clock3 className="h-7 w-7" />
              )}
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-primary">Promotion request</p>
              <CardTitle className="text-3xl">Your boost is in motion</CardTitle>
              <CardDescription className="max-w-xl text-base leading-7">
                {current.message}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Badge variant="outline" className={cn("gap-2 px-3 py-1.5", current.color)}>
              <span className="h-2 w-2 bg-current" />
              {current.label}
            </Badge>

            <div className="grid border-y sm:grid-cols-3">
              <div className="border-b py-4 sm:border-b-0 sm:border-r sm:px-4 sm:first:pl-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Listing</p>
                <p className="mt-1 truncate font-semibold">{listing.title}</p>
              </div>
              <div className="border-b py-4 sm:border-b-0 sm:border-r sm:px-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Duration</p>
                <p className="mt-1 font-semibold">{activePromotion.durationDays} days</p>
              </div>
              <div className="py-4 sm:pl-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Budget</p>
                <p className="mt-1 font-semibold">৳{formatNumber(activePromotion.totalBudget)}</p>
              </div>
            </div>

            {activePromotion.reviewNote ? (
              <div className="border-l-4 border-amber-500 bg-amber-50 p-4 text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
                <p className="text-sm font-semibold">Reviewer note</p>
                <p className="mt-1 text-sm leading-6 opacity-80">{activePromotion.reviewNote}</p>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={`/listings/${listing.slug}`}>Back to listing</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/listings">My listings</Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main>
      <div className="container max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" aria-label="Back to listing">
              <Link href={`/listings/${listing.slug}`}><ArrowLeft /></Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <h1 className="text-3xl font-bold">Boost your listing</h1>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Create a focused campaign in a few minutes</p>
            </div>
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Reviewed by BeforeSell
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="space-y-6">
            {submittedPromotion?.status === "REJECTED" ? (
              <div className="border border-destructive/30 bg-destructive/10 p-4 text-destructive">
                <p className="font-semibold">Your previous request needs changes</p>
                <p className="mt-1 text-sm leading-6">
                  {submittedPromotion.reviewNote || "Please review your campaign details and submit again."}
                </p>
              </div>
            ) : null}

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-primary"><Target /></div>
                  <div className="space-y-1">
                    <CardTitle>Audience</CardTitle>
                    <CardDescription>Choose who is most likely to respond to your listing.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
              <button
                type="button"
                onClick={() => setAudienceType("AUTOMATIC")}
                aria-pressed={audienceType === "AUTOMATIC"}
                className={cn(
                  "flex w-full items-start justify-between border p-4 text-left transition-colors",
                  audienceType === "AUTOMATIC" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50 hover:bg-muted/50",
                )}
              >
                <span>
                  <span className="flex items-center gap-2 font-semibold"><Sparkles className="h-4 w-4 text-primary" />Smart audience</span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">BeforeSell automatically finds people likely to be interested.</span>
                </span>
                <span className={cn("mt-1 flex h-5 w-5 items-center justify-center border", audienceType === "AUTOMATIC" ? "border-primary bg-primary text-primary-foreground" : "border-input")}>
                  {audienceType === "AUTOMATIC" ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAudienceType("CUSTOM")}
                aria-pressed={audienceType === "CUSTOM"}
                className={cn(
                  "flex w-full items-start justify-between border p-4 text-left transition-colors",
                  audienceType === "CUSTOM" ? "border-primary bg-primary/5 ring-1 ring-primary" : "hover:border-primary/50 hover:bg-muted/50",
                )}
              >
                <span>
                  <span className="font-semibold">People you choose</span>
                  <span className="mt-1 block text-sm leading-6 text-muted-foreground">Set a location and age range manually.</span>
                </span>
                <span className={cn("mt-1 flex h-5 w-5 items-center justify-center border", audienceType === "CUSTOM" ? "border-primary bg-primary text-primary-foreground" : "border-input")}>
                  {audienceType === "CUSTOM" ? <Check className="h-3.5 w-3.5" /> : null}
                </span>
              </button>

              <div className="grid gap-4 border-t pt-5 sm:grid-cols-2 lg:grid-cols-4">
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-primary/10 text-primary"><CalendarDays /></div>
                  <div className="space-y-1">
                    <CardTitle>Schedule and budget</CardTitle>
                    <CardDescription>Control when your campaign runs and how much you spend.</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-7">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start date</Label>
                  <Input id="start-date" type="date" min={localDateValue(new Date())} value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <div className="flex h-9 border border-input">
                    <button type="button" className="w-10 text-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setDurationDays((value) => Math.max(1, value - 1))} aria-label="Decrease duration">−</button>
                    <Input id="duration" className="h-full border-y-0 text-center" type="number" min={1} max={30} value={durationDays} onChange={(event) => setDurationDays(Math.min(30, Math.max(1, Number(event.target.value))))} />
                    <button type="button" className="w-10 text-xl text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setDurationDays((value) => Math.min(30, value + 1))} aria-label="Increase duration">+</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <div className="flex h-9 items-center border border-input bg-muted px-3 text-sm text-muted-foreground">
                    {endDate.toLocaleDateString("en-BD", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div><Label htmlFor="daily-budget" className="text-base font-bold">Daily budget</Label><p className="mt-1 text-sm text-muted-foreground">Minimum ৳100 per day</p></div>
                  <div className="relative w-36">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 font-semibold text-primary">৳</span>
                    <Input id="daily-budget" className="pl-8 text-right text-lg font-bold text-primary" type="number" min={100} max={5000} value={dailyBudget} onChange={(event) => setDailyBudget(Math.min(5000, Math.max(100, Number(event.target.value))))} />
                  </div>
                </div>
                <input aria-label="Daily budget" className="boost-range w-full" type="range" min={100} max={5000} step={50} value={dailyBudget} onChange={(event) => setDailyBudget(Number(event.target.value))} />
                <div className="mt-1 flex justify-between text-xs text-muted-foreground"><span>৳100</span><span>৳5,000</span></div>
                <div className="mt-5 border-l-4 border-primary bg-primary/5 px-4 py-3">
                  <p className="text-sm">Estimated <strong>{formatNumber(estimatedMinReach)}–{formatNumber(estimatedMaxReach)} views per day</strong> based on this budget.</p>
                </div>
              </div>
              </CardContent>
            </Card>
          </div>

          <aside className="self-start space-y-6 xl:sticky xl:top-24">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-4">
                  <CardTitle>Ad preview</CardTitle>
                  <Badge variant="secondary">Live preview</Badge>
                </div>
              </CardHeader>
              <CardContent>
              <div className="overflow-hidden border bg-card">
                <div className="flex items-center gap-3 p-3">
                  <div className="flex h-9 w-9 items-center justify-center bg-primary font-bold text-primary-foreground">B</div>
                  <div><p className="text-sm font-bold">BeforeSell</p><p className="text-[11px] text-muted-foreground">Sponsored · {location}</p></div>
                </div>
                <p className="min-h-16 px-3 pb-3 text-sm leading-5">A great deal is waiting. Check out {listing.title} on BeforeSell today.</p>
                <div className="relative aspect-[4/3] bg-muted">
                  {listing.images[0] ? <Image src={listing.images[0]} alt={listing.title} fill unoptimized className="object-cover" sizes="360px" /> : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Listing image</div>}
                  <Badge className="absolute left-3 top-3">Featured</Badge>
                </div>
                <div className="flex items-center justify-between gap-3 bg-muted/50 p-3">
                  <div className="min-w-0"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">{listing.category}</p><p className="truncate text-sm font-bold">{listing.title}</p><p className="text-sm font-bold text-primary">৳{formatNumber(listing.price)}</p></div>
                  <Button type="button" size="sm"><MessageCircle />Message</Button>
                </div>
              </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2"><WalletCards className="h-5 w-5 text-primary" /><CardTitle>Campaign summary</CardTitle></div>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Daily budget</dt><dd className="font-semibold">৳{formatNumber(dailyBudget)}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Duration</dt><dd className="font-semibold">{durationDays} days</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Audience</dt><dd className="text-right font-semibold">{audienceType === "AUTOMATIC" ? "Smart" : `${minAge}–${maxAge}`}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Gender</dt><dd className="font-semibold">{gender === "BOTH" ? "Both" : gender === "MALE" ? "Male" : "Female"}</dd></div>
                  <div className="border-t pt-4"><div className="flex items-end justify-between"><dt className="font-semibold">Total budget</dt><dd className="text-2xl font-bold text-primary">৳{formatNumber(totalBudget)}</dd></div><p className="mt-1 text-right text-xs text-muted-foreground">Final billing is arranged after approval</p></div>
                </dl>
                <Button type="submit" size="lg" className="mt-6 h-12 w-full text-base" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
                  {isSubmitting ? "Submitting…" : "Submit for review"}
                  {isSubmitting ? null : <ChevronRight className="ml-auto" />}
                </Button>
                <p className="mt-4 text-center text-xs leading-5 text-muted-foreground">By submitting, you confirm that this ad accurately represents your listing.</p>
              </CardContent>
            </Card>
          </aside>
        </form>
      </div>
    </main>
  );
}
