'use client'

import { useEffect, useState } from 'react'
import { useCart } from '@/components/CartContext'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CatalogPage() {
  const { items, addItem, removeItem, clear } = useCart()
  const router = useRouter()
  const [catalog, setCatalog] = useState<any[]>([])

  // Fetch catalog on load
  useEffect(() => {
    const fetchCatalog = async () => {
      const { data, error } = await supabase
        .from('food_catalog')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading catalog:', error)
      } else {
        setCatalog(data || [])
      }
    }

    fetchCatalog()

    // Realtime subscription to food_catalog changes
    const channel = supabase
      .channel('food_catalog_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'food_catalog' },
        (payload) => {
          console.log('Catalog updated:', payload)
          fetchCatalog() // refresh catalog when changes happen
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleCheckout = async () => {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return alert('Login required')
    }

    const orders = items.map((item) => ({
      user_id: user.id,
      food: item.name,
      qty: item.qty,
      price: item.price,
      total: item.qty * item.price,
    }))

    const { data, error } = await supabase
      .from('orders')
      .insert(orders)
      .select()

    if (error) {
      console.error(error)
      alert('Order failed: ' + error.message)
    } else {
      console.log('Order saved:', data)
      clear()
      alert('Order placed!')
    }
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Menu</h1>

      {catalog.map((food) => (
        <div key={food.id} className="flex items-center mb-2">
          <p className="mr-2">
            {food.name} - ${food.price}
          </p>
          <button
            onClick={() =>
              addItem({
                id: food.id,
                name: food.name,
                price: parseFloat(food.price),
                qty: 1,
                image_url: food.image_url || '',
              })
            }
            className="bg-blue-500 text-white px-2 rounded"
          >
            Add
          </button>
        </div>
      ))}

      <h2 className="mt-6 text-xl font-semibold">Cart</h2>
      {items.length === 0 && <p>Cart is empty</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-center mb-1">
          <p>
            {item.name} x {item.qty} = ${item.qty * item.price}
          </p>
          <button
            onClick={() => removeItem(item.id)}
            className="ml-2 bg-red-500 text-white px-2 rounded"
          >
            Remove
          </button>
        </div>
      ))}

      {items.length > 0 && (
        <button
          onClick={handleCheckout}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          Checkout
        </button>
      )}
    </main>
  )
}
