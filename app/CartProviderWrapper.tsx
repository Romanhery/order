'use client'

import { CartProvider } from '@/components/CartContext'

export default function CartProviderWrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}
