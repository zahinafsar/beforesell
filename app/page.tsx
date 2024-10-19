'use client';

import { useScrollObserver } from '@/hooks/useScrollObserver';
import { Hero } from '@/components/hero';
import { Features } from '@/components/features';
import { CTA } from '@/components/cta';
import { Navbar } from '@/components/navbar';
import { useAuth } from '@/hooks/AuthContext';

export default function Home() {
  const { isScrolled, navbarRef } = useScrollObserver();
  const { user } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <div ref={navbarRef} className="relative z-50">
        <Navbar isScrolled={isScrolled} />
      </div>
      <Hero />
      <Features />
      <CTA />
    </div>
  );
}
