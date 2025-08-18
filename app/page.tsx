'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        router.push('/orders')  // ✅ logged in → go to orders
      } else {
        router.push('/login')   // 🚪 not logged in → go to login
      }
    }
    checkUser()
  }, [router])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-xl font-bold">Loading...</h1>
    </main>
  )
}
