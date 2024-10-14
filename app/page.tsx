'use client';

import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { CTA } from '@/components/cta';
import { useScrollObserver } from '@/hooks/useScrollObserver';
import { Navbar } from '@/components/navbar';

export default function Home() {
  const { isScrolled, navbarRef } = useScrollObserver();

  return (
    <div className="flex flex-col min-h-screen">
      <div ref={navbarRef} className="relative">
        <Navbar isScrolled={isScrolled} />
      </div>
      <Hero />
      <Features />
      <CTA />
    </div>
  );
}
