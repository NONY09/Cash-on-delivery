import { createClient } from '@supabase/supabase-js';
const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, apikey, x-client-info, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Content-Type': 'application/json', 'Cache-Control': 'no-store' };
const reply = (status: number, message: string) => new Response(JSON.stringify({ message }), { status, headers });
Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return reply(405, 'Método não permitido.');
  const authorization = request.headers.get('Authorization') || '';
  if (!authorization.startsWith('Bearer ')) return reply(401, 'Entre novamente na sua conta.');
  const url = Deno.env.get('SUPABASE_URL')!;
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const options = { auth: { persistSession: false, autoRefreshToken: false } };
  const userClient = createClient(url, anonKey, { ...options, global: { headers: { Authorization: authorization } } });
  try {
    const { data: { user }, error } = await userClient.auth.getUser();
    if (error || !user?.email || !user.email_confirmed_at) return reply(401, 'Entre novamente na sua conta.');
    const { data: profile, error: profileError } = await userClient.from('chega_profiles').select('id').eq('id', user.id).maybeSingle();
    if (profileError || !profile) return reply(403, 'Esta sessão não permite excluir a conta. Entre novamente.');
    const text = await request.text();
    if (text.length > 4096) return reply(400, 'Solicitação inválida.');
    let body;
    try { body = JSON.parse(text); } catch { return reply(400, 'Solicitação inválida.'); }
    if (body.confirm !== 'EXCLUIR' || typeof body.password !== 'string' || body.password.length > 128 || !body.password) return reply(400, 'Confirme a exclusão com sua senha.');
    const verifier = createClient(url, anonKey, options);
    const { data: verified, error: verifyError } = await verifier.auth.signInWithPassword({ email: user.email, password: body.password, options: { captchaToken: typeof body.captchaToken === 'string' ? body.captchaToken : undefined } });
    if (verifyError || verified.user?.id !== user.id) return reply(403, 'Não foi possível confirmar sua senha.');
    const admin = createClient(url, serviceKey, options);
    const { error: signOutError } = await admin.auth.admin.signOut(verified.session!.access_token, 'global');
    if (signOutError) return reply(500, 'Não foi possível encerrar as sessões. Tente novamente.');
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) return reply(500, 'Não foi possível excluir a conta. Entre novamente e tente outra vez.');
    return reply(200, 'Sua conta e seu perfil foram excluídos. Pedidos feitos na Logzz seguem as condições desse serviço.');
  } catch { return reply(500, 'Não foi possível concluir a solicitação. Tente novamente.'); }
});
