'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function OrdersPage() {
  const [food, setFood] = useState('')
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const router = useRouter()

  // ✅ Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
        await ensureUser(user)
        await fetchOrders(user)
      }
    }
    checkUser()
  }, [router])

  // Ensure the user exists in the users table
  const ensureUser = async (user: any) => {
    const { error } = await supabase
      .from('users')
      .upsert([{ id: user.id, email: user.email }])

    if (error) console.error('Error ensuring user exists:', error)
  }

  // Fetch the current user's orders
  const fetchOrders = async (user: any) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
    } else {
      setOrders(data)
    }
  }

  // Add a new order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { data, error } = await supabase
      .from('orders')
      .upsert([{ food, user_id: user.id }]) // ✅ prevents duplicate/fk errors

    if (error) {
      setMessage('❌ Error: ' + error.message)
    } else {
      setMessage('✅ Order added!')
      setFood('')
      fetchOrders(user) // refresh the list
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      {user && (
        <div className="mb-4 flex gap-2 items-center">
          <span className="text-gray-600">Logged in as {user.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Log Out
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-64 mb-6">
        <input
          type="text"
          placeholder="Enter your food"
          value={food}
          onChange={(e) => setFood(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Order
        </button>
      </form>

      {message && <p className="mt-2">{message}</p>}

      <h2 className="text-xl font-semibold mt-4 mb-2">Your Orders</h2>
      <ul className="w-64 border rounded p-2">
        {orders.length === 0 && <li className="text-gray-500">No orders yet</li>}
        {orders.map((order) => (
          <li key={order.id} className="border-b last:border-b-0 p-1">
            {order.food}
          </li>
        ))}
      </ul>
    </main>
  )
}
