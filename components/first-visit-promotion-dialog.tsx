"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const promotionDialogStorageKey = "beforesell-promotion-dialog-seen";

export function FirstVisitPromotionDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(promotionDialogStorageKey)) return;
      sessionStorage.setItem(promotionDialogStorageKey, "true");
    } catch {}

    setOpen(true);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        lang="bn"
        triggerClassname="text-white"
        className="overflow-hidden border-0 bg-[#f7f2e8] p-0 shadow-2xl sm:max-w-[580px]"
      >
        <div className="relative bg-[#014069] px-6 pb-8 pt-10 text-white sm:px-10 sm:pb-10">
          <div className="absolute -right-12 -top-12 h-40 w-40 border border-white/15" />
          <div className="absolute right-8 top-8 h-16 w-16 border border-white/10" />
          <div className="relative flex h-12 w-12 items-center justify-center bg-[#f4b942] text-[#014069]">
            <Megaphone className="h-6 w-6" aria-hidden="true" />
          </div>
          <DialogHeader className="relative mt-6 text-left">
            <DialogTitle className="font-bengali text-2xl font-bold leading-[1.25] sm:text-3xl">
              আমরাই একমাত্র আপনার বিজ্ঞাপন ফেসবুকের মাধ্যমে প্রচার করি, যা আপনার
              সঠিক ক্রেতা পাওয়ার সম্ভাবনা ১০০ গুণ বাড়িয়ে দেয়
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="space-y-6 px-6 pb-6 pt-6 sm:px-10 sm:pb-9">
          <DialogDescription asChild>
            <div className="font-bengali space-y-4 text-base text-[#263640]">
              <p>
                আমরা আপনার পণ্যটি ফেসবুক বিজ্ঞাপনের মাধ্যমে প্রচার করব। ফেসবুক জানে আপনার
                পণ্যটি কার প্রয়োজন, কোন বয়সের মানুষের প্রয়োজন এবং কোন এলাকার
                মানুষের প্রয়োজন। তাই এখনই আমাদের এখানে বিজ্ঞাপন দিন আর নিশ্চিন্ত থাকুন। অপ্রয়োজনীয়
                কল থেকে দূরে থাকুন।
              </p>
            </div>
          </DialogDescription>

          {/* <div className="grid grid-cols-3 border-y border-[#014069]/15 py-4">
            {audienceSignals.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="font-bengali flex flex-col items-center gap-2 border-r border-[#014069]/15 px-2 text-center text-sm font-semibold text-[#014069] last:border-r-0 sm:flex-row sm:justify-center"
              >
                <Icon className="h-4 w-4 shrink-0 text-[#d58b00]" aria-hidden="true" />
                <span>{label}</span>
              </div>
            ))}
          </div> */}

          <DialogFooter className="font-bengali flex-col-reverse sm:flex-row sm:justify-between">
            <DialogClose asChild>
              <Button variant="ghost" className="text-[#014069]/70 hover:text-[#014069]">
                এখন নয়
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button asChild className="h-12 bg-[#014069] px-6 text-base hover:bg-[#012f4d]">
                <Link href="/listings/new">
                  বিজ্ঞাপন দিন
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
