'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Order {
  id: string
  food: string
  user_id: string
  created_at: string
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const audioRef = useRef<HTMLAudioElement>(null)

  // Fetch existing orders
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setOrders(data)
  }

  useEffect(() => {
    fetchOrders()

    // Subscribe to real-time inserts
    const subscription = supabase
  .channel('public:orders')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'orders' },
    (payload) => {
      setOrders((prev) => [payload.new as Order, ...prev]) // ✅ cast to Order
      if (audioRef.current) audioRef.current.play()
    }
  )
  .subscribe()


    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      <audio ref={audioRef} src="/ping.mp3" preload="auto"></audio>

      <table className="min-w-full bg-white rounded shadow">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2">Order ID</th>
            <th className="p-2">Food</th>
            <th className="p-2">User ID</th>
            <th className="p-2">Created At</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b">
              <td className="p-2">{order.id}</td>
              <td className="p-2">{order.food}</td>
              <td className="p-2">{order.user_id}</td>
              <td className="p-2">{new Date(order.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  )
}
