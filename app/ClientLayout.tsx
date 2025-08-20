// app/ClientLayout.tsx
'use client'

import { CartProvider } from '@/components/CartContext'
import TopNav from '@/components/TopNav'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <TopNav />
      {children}
    </CartProvider>
  )
}
