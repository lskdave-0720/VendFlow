import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const realmId = searchParams.get('realmId'); // QuickBooks company ID

  // Verify state to prevent CSRF
  const storedState = request.cookies.get('qb_oauth_state')?.value;
  if (!code || !state || !realmId || state !== storedState) {
    console.error('Invalid QuickBooks callback parameters');
    return NextResponse.redirect(new URL('/dashboard?error=invalid_callback', request.url));
  }

  // Exchange authorization code for access/refresh tokens
  const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${Buffer.from(
        `${process.env.NEXT_PUBLIC_QB_CLIENT_ID}:${process.env.NEXT_PUBLIC_QB_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.NEXT_PUBLIC_QB_REDIRECT_URI!,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token exchange failed:', errorText);
    return NextResponse.redirect(new URL('/dashboard?error=token_exchange_failed', request.url));
  }

  const tokens = await tokenResponse.json();
  const {
    access_token,
    refresh_token,
    expires_in,
  } = tokens;

  // Get the authenticated user
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Store the connection in Supabase
  const { error: insertError } = await supabase
    .from('quickbooks_connections')
    .upsert({
      user_id: user.id,
      realm_id: realmId,
      access_token,
      refresh_token,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (insertError) {
    console.error('Failed to store connection:', insertError);
    return NextResponse.redirect(new URL('/dashboard?error=storage_failed', request.url));
  }

  // Clear the state cookie
  const response = NextResponse.redirect(new URL('/dashboard?success=connected', request.url));
  response.cookies.set('qb_oauth_state', '', { maxAge: 0 });
  return response;
}