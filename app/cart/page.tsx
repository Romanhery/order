'use client'

import { useCart } from '@/app/components/CartContext'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function CartPage() {
  const { items, removeItem, clear } = useCart()
  const router = useRouter()

  const handleCheckout = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return alert('Login required')

    const orders = items.map((item) => ({
      food: item.name,
      user_id: user.id,
    }))

    const { error } = await supabase.from('orders').insert(orders)
    if (error) alert(error.message)
    else {
      clear()
      alert('Order placed!')
      router.push('/orders')
    }
  }

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cart</h1>
      {items.length === 0 && <p>Cart is empty</p>}
      {items.map((item) => (
        <div key={item.id} className="flex items-center mb-2">
          {item.image_url && (
            <img src={item.image_url} className="w-16 h-16 rounded mr-4" />
          )}
          <div>
            <h2>{item.name}</h2>
            <p>${item.price.toFixed(2)} x {item.qty}</p>
          </div>
          <button
            onClick={() => removeItem(item.id)}
            className="ml-auto bg-red-500 text-white px-2 rounded"
          >
            Remove
          </button>
        </div>
      ))}
      {items.length > 0 && (
        <>
          <p className="font-bold mt-4">Total: ${total.toFixed(2)}</p>
          <button
            onClick={handleCheckout}
            className="mt-2 bg-green-500 text-white px-4 py-2 rounded"
          >
            Place Order
          </button>
        </>
      )}
    </main>
  )
}
