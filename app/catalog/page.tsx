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
  <h1 className="text-3xl font-bold mb-6 text-center">Menu</h1>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {catalog.map((food) => (
      <div
        key={food.id}
        className="bg-white shadow-md rounded-lg overflow-hidden flex flex-col"
      >
        {food.image_url ? (
          <img
            src={food.image_url}
            alt={food.name}
            className="w-full h-40 object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}

        <div className="p-4 flex flex-col flex-grow">
          <h3 className="text-xl font-semibold mb-2">{food.name}</h3>
          <p className="text-gray-600 mb-4 flex-grow">{food.description || 'Delicious food'}</p>
          <div className="flex items-center justify-between mt-auto">
            <span className="font-bold text-lg">${parseFloat(food.price).toFixed(2)}</span>
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
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Cart Section */}
  <h2 className="mt-8 text-2xl font-semibold">Cart</h2>
  {items.length === 0 && <p>Cart is empty</p>}
  {items.map((item) => (
    <div key={item.id} className="flex items-center justify-between mb-2 bg-gray-50 p-2 rounded">
      <p>
        {item.name} qty ({item.qty})
      </p>
      <button
        onClick={() => removeItem(item.id)}
        className="bg-red-500 hover:bg-red-600 text-white px-2 rounded transition"
      >
        Remove
      </button>
    </div>
  ))}

  {items.length > 0 && (
    <button
      onClick={handleCheckout}
      className="mt-4 bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded transition"
    >
      Checkout
    </button>
  )}
</main>

  )
}
