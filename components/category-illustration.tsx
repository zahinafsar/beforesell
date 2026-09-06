import Image from "next/image";
import { CategoryIcon } from "@/components/category-icon";

const illustrations: Partial<Record<string, string>> = {
  agriculture: "/illustrations/categories/agriculture.webp",
  business: "/illustrations/categories/business.webp",
  education: "/illustrations/categories/education.webp",
  electronics: "/illustrations/categories/electronics.webp",
  essentials: "/illustrations/categories/essentials.webp",
  fashion: "/illustrations/categories/fashion.webp",
  "hobbies-sports": "/illustrations/categories/hobbies-sports.webp",
  "home-living": "/illustrations/categories/home-living.webp",
  pets: "/illustrations/categories/pets.webp",
  property: "/illustrations/categories/property.webp",
  services: "/illustrations/categories/services.webp",
  vehicles: "/illustrations/categories/vehicles.webp",
};

interface CategoryIllustrationProps {
  slug: string;
  iconName: string | null;
}

export function CategoryIllustration({ slug, iconName }: CategoryIllustrationProps) {
  const src = illustrations[slug];

  return (
    <div className="relative min-h-0 flex-1 bg-white" aria-hidden="true">
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes="(min-width: 1280px) 16vw, (min-width: 1024px) 20vw, (min-width: 768px) 25vw, (min-width: 640px) 33vw, 50vw"
          className="object-contain p-2 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full items-center justify-center text-[#014069]">
          <CategoryIcon iconName={iconName} className="h-16 w-16" />
        </div>
      )}
    </div>
  );
}
