// Supabase Edge Function: invite-user (runs in Deno on Supabase; IDE may show errors without Deno extension)
// Requires: SERVICE_ROLE_KEY secret (Supabase reserves SUPABASE_ prefix)
// Call with: POST /functions/v1/invite-user
// Body: { "email": "user@example.com", "role": "staff" }
// Headers: Authorization: Bearer <session.access_token> (must be admin)
// @ts-nocheck — file runs in Deno; IDE uses Node/TS and doesn't know Deno globals or URL imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY');
    if (!serviceRoleKey) {
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: SERVICE_ROLE_KEY secret not set' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const anonClient = createClient(supabaseUrl, supabaseAnonKey);
    const { data: { user }, error: userError } = await anonClient.auth.getUser(token);
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: userError?.message || 'Invalid or expired token. Try logging in again.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile } = await adminClient
      .from('profiles')
      .select('role')
      .eq('auth_uid', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Only administrators can invite users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const role = typeof body?.role === 'string' ? body.role.trim().toLowerCase() : 'user';
    const validRoles = ['user', 'staff', 'manager', 'admin'];
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!validRoles.includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Use one of: user, staff, manager, admin' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      { data: { role }, redirectTo: undefined }
    );

    if (inviteError) {
      const message = inviteError.message || 'Failed to send invite';
      return new Response(
        JSON.stringify({ error: message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const invitedUserId = inviteData?.user?.id;
    if (invitedUserId) {
      await adminClient
        .from('profiles')
        .update({ role })
        .eq('auth_uid', invitedUserId);
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Invitation sent to ' + email }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
