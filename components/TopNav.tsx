'use client';

import Link from 'next/link';
import { useCart } from '@/components/CartContext';

export default function TopNav() {
  const { count, total } = useCart();
  return (
    <header className="w-full border-b bg-white sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between p-3">
        <nav className="flex gap-4">
          <Link href="/catalog" className="font-semibold">Catalog</Link>
          <Link href="/orders">Orders</Link>
        </nav>
        <Link
          href="/cart"
          className="rounded bg-blue-600 text-white px-3 py-1 text-sm"
        >
          Cart • {count} • ${total.toFixed(2)}
        </Link>
      </div>
    </header>
  );
}
