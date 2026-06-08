import { Hero } from '@/features/home/components/hero'
import { FeaturedCollections } from '@/features/home/components/featured-collections'
import { HowToOrder } from '@/features/home/components/how-to-order'
import { HomeCta } from '@/features/home/components/home-cta'

export function HomePage() {
  return (
    <div className="space-y-16 md:space-y-24">
      <Hero />
      <FeaturedCollections />
      <HowToOrder />
      <HomeCta />
    </div>
  )
}
