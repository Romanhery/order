'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Order {
  id: string
  food: string
  user_id: string
  created_at: string
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audio = typeof window !== 'undefined' ? new Audio('/ping.mp3') : null

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data) setOrders(data)
  }

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('public:orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as Order
          setOrders((prev) => [newOrder, ...prev])
          if (audioEnabled && audio) {
            audio.currentTime = 0
            audio.play().catch((err) => console.log('Audio play error:', err))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [audioEnabled])

  const enableAudio = () => {
    if (audio) {
      audio.play()
        .then(() => {
          audio.pause()
          audio.currentTime = 0
          setAudioEnabled(true)
        })
        .catch((err) => console.log('Audio enable error:', err))
    }
  }

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      {!audioEnabled && (
        <button
          onClick={enableAudio}
          className="mb-4 bg-yellow-500 text-white px-4 py-2 rounded"
        >
          Enable Notifications
        </button>
      )}
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
          {orders.length === 0 && (
            <tr>
              <td colSpan={4} className="p-2 text-gray-500 text-center">
                No orders yet
              </td>
            </tr>
          )}
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
