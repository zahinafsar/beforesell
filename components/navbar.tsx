import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { assets } from '@/app/assets';
import { ModeToggle } from './theme-toggle';
import { ROUTES } from '@/routes';
import { navMenuData } from '@/public/navbarData';
import UserMenu from '@/app/(auth)/logout/UserMenu';
import { useAuth } from '@/hooks/AuthContext';

export const Navbar = ({ isScrolled }: { isScrolled: boolean }) => {
  const { user, loading, render } = useAuth();
  // console.log(user);
  if (render) return;
  return (
    <nav
      className={`border-b fixed right-0 left-0  top-0 ${isScrolled ? 'dark:bg-slate-950 shadow-xl bg-slate-100' : ''}`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href={ROUTES.HOME} className="flex items-center">
              <Image
                src={assets.logo}
                alt="BeforeSell Logo"
                className="h-10 w-auto mr-2"
              />
              <span className="text-2xl font-bold">BeforeSell</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center  gap-10">
            <div className="flex items-center gap-10">
              {navMenuData.map((nav, id) => (
                <Link key={id} href={nav.herf} className="text-sm font-medium">
                  {nav.label}
                </Link>
              ))}
            </div>
            {/* <ModeToggle /> */}
            <div className="flex items-center gap-3">
              {!user ? (
                <>
                  <Link href="/login">
                    <Button variant="secondary">Log in</Button>
                  </Link>
                  <Link href="/signup">
                    <Button>Sign up</Button>
                  </Link>
                </>
              ) : (
                <UserMenu />
              )}

              <ModeToggle />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
