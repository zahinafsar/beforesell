import { Button } from '@/components/ui/button'
import Link from 'next/link'

export const CTA = () => {
  return (
    <div className="bg-secondary text-secondary-foreground py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
        <p className="text-lg mb-8">Sign up now and experience the difference!</p>
        <Link href="/signup">
          <Button size="lg">Sign up now</Button>
        </Link>
      </div>
    </div>
  )
}
