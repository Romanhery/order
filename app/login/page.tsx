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

  // Signup function
  const handleSignup = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else if (data.user) {
      // Ensure the user exists in your users table to avoid foreign key errors
      // ✅ Supabase v2 upsert (no onConflict needed)
        const ensureUser = async (user: any) => {
        const { error } = await supabase
            .from('users')
            .upsert([{ id: user.id, email: user.email }]); // upsert by primary key automatically

        if (error) console.error('Error ensuring user exists:', error);
        };

      ensureUser(data.user);
      router.push('/orders') // redirect after signup
    }
  // Login function
  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else if (data.user) {
      router.push('/orders') // redirect after login
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Login / Signup</h1>
        {error && <p className="text-red-500 mb-4">ERROR</p>}

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
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition"
        >
          {loading ? 'Signing up...' : 'Signup'}
        </button>
      </div>
    </div>
  )

}
}
