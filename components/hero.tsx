import { Button } from '@/components/ui/button';
import Image, { StaticImageData } from 'next/image';
import Link from 'next/link';
import bannerImg from '/public/img1.jpg';
import bannerImg2 from '/public/img2.jpg';
import { Frown, Smile } from 'lucide-react';
import bannerImg3 from '/public/img3.jpg';
import { useEffect, useMemo, useState } from 'react';

export const Hero = () => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [img, setImg] = useState(bannerImg);
  const animatedClass = 'hover:scale-105 transition-all  delay-150';

  const imageArray = useMemo(() => [bannerImg, bannerImg2, bannerImg3], []);

  const handleButtonClick = (slideNumber: StaticImageData) => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setTimeout(() => {
        setImg(slideNumber);
        setIsTransitioning(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning) {
        setIsTransitioning(true);
        setTimeout(() => {
          setImg((prevImg) => {
            const currentIndex = imageArray.indexOf(prevImg);
            const nextIndex = (currentIndex + 1) % imageArray.length;
            return imageArray[nextIndex];
          });
          setIsTransitioning(false);
        }, 500);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isTransitioning, imageArray]);
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
              <Button size="lg">Let&apos;s Start</Button>
            </Link>
          </div>
          <div className="flex items-center justify-around">
            <div
              className={`${isTransitioning ? 'opacity-0' : 'opacity-100'} w-11/12 relative    transform overflow-hidden rounded-lg transition-opacity duration-500 `}
            >
              <Image
                src={img}
                alt="bg"
                className="h-[500px] object-fill rounded-lg mt-8"
              />
            </div>
            <div className="flex flex-row gap-4 lg:flex-col">
              {imageArray.map((i, idx) => (
                <button
                  key={idx}
                  onClick={() => handleButtonClick(i)}
                  className={`${img === i ? 'w-10 bg-primary h-10' : 'w-10 bg-gray-100 h-10'} ${isTransitioning ? 'opacity-70' : 'opacity-100'} ${animatedClass} flex items-center justify-center flex-col  rounded-full  transition-opacity duration-500`}
                >
                  {img === i ? <Smile /> : <Frown className="text-[#ff7575] " />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
