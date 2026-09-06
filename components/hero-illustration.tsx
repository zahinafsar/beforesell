import Image from "next/image";

export function HeroIllustration() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[680px]">
      <Image
        src="/illustrations/hero-exchange.webp"
        alt="Two happy people exchanging a laptop and cash."
        fill
        priority
        sizes="(min-width: 1536px) 680px, (min-width: 1024px) 50vw, (min-width: 768px) 680px, 100vw"
        quality={90}
        className="object-contain"
      />
    </div>
  );
}
