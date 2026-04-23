import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_SITE_URL));
  }

  // Generate a random state value to prevent CSRF
  const state = crypto.randomUUID();

  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_QB_CLIENT_ID!,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    redirect_uri: process.env.NEXT_PUBLIC_QB_REDIRECT_URI!,
    state,
  });

  const qbAuthUrl = `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;

  const response = NextResponse.redirect(qbAuthUrl);

  // Set state in a cookie so we can verify it in the callback
  response.cookies.set('qb_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 30, // 30 minutes
    path: '/',
  });

  return response;
}