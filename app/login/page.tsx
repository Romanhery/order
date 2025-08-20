'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // LOGIN
  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
    } else if (data.user) {
      // Fetch role from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (userError) {
        console.error('Failed to fetch role:', userError)
        setError('Could not fetch user role')
      } else if (userData?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/catalog')
      }
    }

    setLoading(false)
  }

  // SIGNUP
  const handleSignup = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
    } else if (data.user) {
      // Create row in users table with default role "user"
      const { error: userError } = await supabase.from('users').upsert([
        {
          id: data.user.id,
          email: data.user.email,
          role: 'user',
        },
      ])

      if (userError) {
        console.error('Error inserting user row:', userError)
      }

      router.push('/catalog')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login / Signup</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border rounded"
        />

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-3 rounded mb-2 hover:bg-blue-600 transition"
        >
          {loading ? 'Logging in…' : 'Login'}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition"
        >
          {loading ? 'Signing up…' : 'Signup'}
        </button>
      </div>
    </div>
  )
}
