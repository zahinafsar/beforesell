import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { assets } from "@/app/assets";
import { ModeToggle } from "./theme-toggle";

export const Navbar = () => {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src={assets.logo}
                alt="BeforeSell Logo"
                className="h-10 w-auto mr-2"
              />
              <span className="text-2xl font-bold">BeforeSell</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/features" className="text-sm font-medium">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium">
              Pricing
            </Link>
            <Link href="/about" className="text-sm font-medium">
              About
            </Link>
            {/* <ModeToggle /> */}
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign up</Button>
            </Link>
            <ModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
};
