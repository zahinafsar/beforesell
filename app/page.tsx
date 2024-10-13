import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { CTA } from "@/components/cta";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Features />
      <CTA />
    </div>
  )
}
