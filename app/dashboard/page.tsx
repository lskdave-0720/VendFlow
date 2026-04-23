import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if QuickBooks is connected
  const { data: connection } = await supabase
    .from('quickbooks_connections')
    .select('realm_id, updated_at')
    .eq('user_id', user.id)
    .single();

  const isConnected = !!connection;

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
              >
                Log Out
              </button>
            </form>
          </div>
        </div>

        {/* QuickBooks Connection Status */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">QuickBooks Connection</h2>
          {isConnected ? (
            <div className="mt-2 flex items-center gap-2 text-green-700">
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">Connected to QuickBooks Online (Company ID: {connection.realm_id})</span>
            </div>
          ) : (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Connect your QuickBooks Online account to start automating vendor statement reconciliation.</p>
              <Link
                href="/api/auth/qb"
                className="mt-3 inline-block rounded-md bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Connect QuickBooks
              </Link>
            </div>
          )}
          {connection && (
            <p className="mt-1 text-xs text-gray-400">
              Last connected: {new Date(connection.updated_at).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Placeholder for future features */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Vendor Statements</h2>
          <p className="mt-2 text-sm text-gray-600">
            {isConnected
              ? 'Your vendor statements will appear here once you upload them.'
              : 'Please connect QuickBooks to get started.'}
          </p>
        </div>
      </div>
    </main>
  );
}