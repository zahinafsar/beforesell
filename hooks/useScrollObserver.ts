'use client';

import { useEffect, useState, useRef } from 'react';

export const useScrollObserver = (threshold: number = 0.7) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const navbarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsScrolled(!entry.isIntersecting);
      },
      {
        threshold,
      },
    );

    if (navbarRef.current) {
      observer.observe(navbarRef.current);
    }

    return () => {
      if (navbarRef.current) {
        observer.unobserve(navbarRef.current);
      }
    };
  }, [navbarRef, threshold]);

  return { isScrolled, navbarRef };
};
