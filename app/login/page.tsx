'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClient();

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setMessage(error.message);
    else setMessage('Check your email to confirm!');
    setLoading(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMessage(error.message);
    else window.location.href = '/dashboard';
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">VendFlow</h1>
          <p className="mt-2 text-gray-600">Sign in to your account</p>
        </div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-3 focus:border-indigo-500 focus:outline-none"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 p-3 focus:border-indigo-500 focus:outline-none"
        />
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="w-full rounded-md bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <button
          onClick={handleSignUp}
          disabled={loading}
          className="w-full rounded-md border border-indigo-600 py-3 font-semibold text-indigo-600 hover:bg-indigo-50"
        >
          Create Account
        </button>
        {message && <p className="text-center text-sm text-red-600">{message}</p>}
        <p className="text-center text-sm text-gray-500">
          <Link href="/" className="underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}
