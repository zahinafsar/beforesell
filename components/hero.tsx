import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import bannerImg from '/public/img1.jpg';

export const Hero = () => {
  return (
    <div className="bg-background py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-2xl lg:text-6xl font-bold  tracking-tight ">
            Product buy and sell will be <br /> easier
          </h1>
          <p className="mt-6 lg:w-3/5 mx-auto text-base lg:text-lg leading-6 lg:leading-8 text-muted-foreground">
            We make it easier for you to sell products and buy products. It also
            guarantees security and no scams. Join us now.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/signup">
              <Button size="lg">Get started</Button>
            </Link>
          </div>
          <Image
            src={bannerImg}
            alt="bg"
            className="h-96 object-center rounded-lg mt-8"
          />
        </div>
      </div>
    </div>
  );
};
