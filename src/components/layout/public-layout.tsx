import { useState } from 'react'
import { Outlet } from 'react-router'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CartSheet } from '@/features/cart/cart-sheet'

export function PublicLayout() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <Header onCartClick={() => setCartOpen(true)} />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-24 pb-24 md:px-10 md:pb-12">
        <Outlet />
      </main>
      <Footer />
      <MobileNav onCartClick={() => setCartOpen(true)} />
      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </div>
  )
}
