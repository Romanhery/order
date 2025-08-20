'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // ⚡ Fetch role from the users table
      const { data: userData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || !userData) {
        router.push('/login')
        return
      }

      if (userData.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/catalog')
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
