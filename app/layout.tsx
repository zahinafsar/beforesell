import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { AuthProvider } from '@/hooks/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BeforeSell - Buy and Sell Used Products Online',
  description:
    'BeforeSell is a platform for buying and selling pre-owned items. Easily list your old products or find great deals on used goods.',
  keywords: 'used products, secondhand marketplace, buy and sell, pre-owned items',
  authors: [{ name: 'BeforeSell', url: 'https://beforesell.com' }],
  openGraph: {
    title: 'BeforeSell - Your Marketplace for Pre-Owned Products',
    description:
      'Join BeforeSell to buy and sell used items. Find great deals or turn your old stuff into cash.',
    type: 'website',
    url: 'https://beforesell.com',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://beforesell.com" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex flex-col min-h-screen">
            {/* <Navbar /> */}
            <main className="flex-grow">
              <AuthProvider>{children}</AuthProvider>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
