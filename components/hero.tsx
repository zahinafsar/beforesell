import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const Hero = () => {
  return (
    <div className="bg-background py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Your Catchy Headline Here
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            A brief description of your product or service that highlights its main
            benefits and value proposition.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/signup">
              <Button size="lg">Get started</Button>
            </Link>
            <Link href="/learn-more" className="text-sm font-semibold leading-6">
              Learn more <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
