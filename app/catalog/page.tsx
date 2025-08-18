'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useCart } from '@/app/components/CartContext'

interface Food {
  id: string
  name: string
  price: number
  image_url?: string
}

export default function CatalogPage() {
  const [catalog, setCatalog] = useState<Food[]>([])
  const { addItem } = useCart()

  useEffect(() => {
    const fetchCatalog = async () => {
      const { data, error } = await supabase
        .from('food_catalog')
        .select('*')
      if (!error && data) setCatalog(data)
    }
    fetchCatalog()
  }, [])

  return (
    <main className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {catalog.map((item) => (
        <div
          key={item.id}
          className="bg-white p-4 rounded shadow cursor-pointer hover:scale-105 transition"
          onClick={() => addItem({ ...item, qty: 1 })}
        >
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-32 object-cover rounded"
            />
          )}
          <h2 className="text-lg font-bold mt-2">{item.name}</h2>
          <p className="text-gray-600">${item.price.toFixed(2)}</p>
        </div>
      ))}
    </main>
  )
}
