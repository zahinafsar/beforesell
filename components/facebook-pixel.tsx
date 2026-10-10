"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type PixelWindow = Window & {
  fbq?: (command: string, event: string) => void;
};

export function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const page = `${pathname}${query ? `?${query}` : ""}`;
  const [ready, setReady] = useState(false);
  const lastTrackedPage = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || lastTrackedPage.current === page) return;

    const pixelWindow = window as PixelWindow;
    if (!pixelWindow.fbq) return;

    pixelWindow.fbq("track", "PageView");
    lastTrackedPage.current = page;
  }, [page, ready]);

  return (
    <Script
      id="facebook-pixel"
      strategy="afterInteractive"
      onReady={() => setReady(true)}
    >
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','2235854476985916');`}
    </Script>
  );
}
