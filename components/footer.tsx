import Link from "next/link";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";
import { Mail, MapPin } from "lucide-react";

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

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/beforesell.official/",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
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
            <div className="mt-4 space-y-2">
              <a
                href="mailto:help.beforesell@gmail.com"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="h-4 w-4" />
                help.beforesell@gmail.com
              </a>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Dhaka, Bangladesh (Remote)
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
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
