import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import AuthProvider from "@/providers/auth-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Toaster } from "sonner";
import { getBaseUrl, generateOrganizationJsonLd, generateWebsiteJsonLd } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "BeforeSell - Buy & Sell in Bangladesh",
    template: "%s | BeforeSell",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/logo.svg",
  },
  description:
    "Bangladesh's trusted marketplace for buying and selling. Post free ads and find great deals on electronics, vehicles, property, and more.",
  keywords: [
    "buy sell bangladesh",
    "classifieds bangladesh",
    "used items bangladesh",
    "electronics sale",
    "vehicles sale",
    "property bangladesh",
    "jobs bangladesh",
    "bikroy alternative",
  ],
  authors: [{ name: "BeforeSell" }],
  creator: "BeforeSell",
  publisher: "BeforeSell",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: siteUrl,
    siteName: "BeforeSell",
    title: "BeforeSell - Buy & Sell in Bangladesh",
    description:
      "Bangladesh's trusted marketplace for buying and selling. Post free ads and find great deals on electronics, vehicles, property, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BeforeSell - Buy & Sell in Bangladesh",
    description:
      "Bangladesh's trusted marketplace for buying and selling. Post free ads and find great deals.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = generateOrganizationJsonLd();
  const websiteJsonLd = generateWebsiteJsonLd();

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <QueryProvider>
          <AuthProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster richColors position="bottom-right" />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
