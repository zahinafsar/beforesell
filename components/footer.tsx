import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

const categories = [
  { name: "Electronics", href: "/categories/electronics" },
  { name: "Vehicles", href: "/categories/vehicles" },
  { name: "Property", href: "/categories/property" },
  { name: "Jobs", href: "/categories/jobs" },
];

const quickLinks = [
  { name: "Post Free Ad", href: "/listings/new" },
  { name: "All Categories", href: "/categories" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Safety Tips", href: "/safety" },
];

const companyLinks = [
  { name: "About Us", href: "/about" },
  { name: "Contact", href: "/contact" },
  { name: "Privacy Policy", href: "/privacy" },
  { name: "Terms of Service", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.svg" alt="BeforeSell" width={32} height={32} className="h-8 w-8" />
              <span className="text-xl font-bold text-primary">BeforeSell</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Bangladesh&apos;s trusted marketplace for buying and selling. Post free ads and find great deals.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BeforeSell. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Made with ❤️ in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}
