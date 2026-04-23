import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect('/login');
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome, {data.user.email}</p>
        <form action="/auth/logout" method="post">
          <button type="submit" className="mt-4 rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700">
            Log Out
          </button>
        </form>
        <p className="mt-8 text-gray-500">Your vendor statements will appear here soon.</p>
      </div>
    </main>
  );
}
