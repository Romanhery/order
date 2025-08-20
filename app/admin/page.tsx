'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [catalog, setCatalog] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState({ name: '', description: '', price: '', image_url: '' })
  const [audioEnabled, setAudioEnabled] = useState(false)
  const audio = typeof window !== 'undefined' ? new Audio('/ping.mp3') : null
  
  const playPing = () => {
  if (audioEnabled && audio) {
    audio.currentTime = 0
    audio.play().catch((err) => console.log('Audio play error:', err))
  }
}


  // Fetch orders + catalog
  useEffect(() => {
    const fetchData = async () => {
      const { data: ordersData } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      const { data: catalogData } = await supabase
        .from('food_catalog')
        .select('*')
        .order('created_at', { ascending: false })

      setOrders(ordersData || [])
      setCatalog(catalogData || [])
      setLoading(false)
    }
    fetchData()
    const channel = supabase
    .channel('public:orders')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'orders' },
      (payload) => {
        const newOrder = payload.new
        setOrders((prev) => [newOrder, ...prev])
        playPing() // 🔔 play sound for new order
      }
    )
    .subscribe()
return () => {
    supabase.removeChannel(channel)
  }
}, [audioEnabled])

  // Add new item
  const addItem = async () => {
    const { data, error } = await supabase.from('food_catalog').insert([newItem]).select()
    if (error) {
      console.error(error)
      return
    }
    setCatalog([...(data || []), ...catalog])
    setNewItem({ name: '', description: '', price: '', image_url: '' })
  }

  // Delete item
  const deleteItem = async (id: string) => {
    const { error } = await supabase.from('food_catalog').delete().eq('id', id)
    if (!error) {
      setCatalog(catalog.filter((item) => item.id !== id))
    }
  }

  // Update item price or desc
  const updateItem = async (id: string, field: string, value: string) => {
    const { error } = await supabase.from('food_catalog').update({ [field]: value }).eq('id', id)
    if (error) {
      console.error(error)
    }
    setCatalog(
      catalog.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  if (loading) return <p className="p-8">Loading...</p>

  return (
    <div className="p-8 space-y-12">
      {/* Orders Section */}
      <section>
        {!audioEnabled && (
  <button
    onClick={() => setAudioEnabled(true)}
    className="mb-4 bg-yellow-500 text-white px-4 py-2 rounded"
  >
    Enable Notifications
  </button>
)}

        <h2 className="text-2xl font-bold mb-4">Orders</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">User</th>
              <th className="border p-2">Food</th>
              <th className="border p-2">Qty</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Total</th>
              <th className="border p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="border p-2">{order.user_id}</td>
                <td className="border p-2">{order.food}</td>
                <td className="border p-2">{order.qty}</td>
                <td className="border p-2">${order.price}</td>
                <td className="border p-2">${order.total}</td>
                <td className="border p-2">{new Date(order.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Catalog Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Food Catalog</h2>

        {/* Add new item */}
        <div className="space-x-2 mb-4">
          <input
            type="text"
            placeholder="Name"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Description"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={newItem.price}
            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
            className="border p-2 rounded"
          />
          <input
            type="text"
            placeholder="Image URL"
            value={newItem.image_url}
            onChange={(e) => setNewItem({ ...newItem, image_url: e.target.value })}
            className="border p-2 rounded"
          />
          <button
            onClick={addItem}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add
          </button>
        </div>

        {/* Catalog list */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Image</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {catalog.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">{item.name}</td>
                <td className="border p-2">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    className="border p-1 rounded w-full"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    step="0.01"
                    value={item.price}
                    onChange={(e) => updateItem(item.id, 'price', e.target.value)}
                    className="border p-1 rounded w-full"
                  />
                </td>
                <td className="border p-2">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover" />
                  ) : (
                    'No Image'
                  )}
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => deleteItem(item.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  )
}
