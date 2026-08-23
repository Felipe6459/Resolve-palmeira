/* GestorPro — Supabase bridge
 * Public publishable/anon key is safe for browser use when RLS is correctly configured.
 * Never put the service_role key in this file.
 */
(function () {
  const SUPABASE_URL = 'https://jbdjfmvdrwdfnuhqrprc.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_3ABEFAwN_wzmSu13EyVOwQ_h5Xfmz80';
  const SDK = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

  let clientPromise;
  async function getClient() {
    if (!clientPromise) {
      clientPromise = import(SDK).then(({ createClient }) =>
        createClient(SUPABASE_URL, SUPABASE_KEY, {
          auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
        })
      );
    }
    return clientPromise;
  }

  window.GestorProSupabase = {
    url: SUPABASE_URL,
    async client() { return getClient(); },
    async session() { const c = await getClient(); return (await c.auth.getSession()).data.session; },
    async user() { const c = await getClient(); return (await c.auth.getUser()).data.user; },
    async signUp({ email, password, fullName, companyName }) {
      const c = await getClient();
      return c.auth.signUp({
        email, password,
        options: { data: { full_name: fullName || '', company_name: companyName || 'Minha empresa' } }
      });
    },
    async signIn(email, password) { const c = await getClient(); return c.auth.signInWithPassword({ email, password }); },
    async signOut() { const c = await getClient(); return c.auth.signOut(); },
    async organization() {
      const c = await getClient();
      const { data: { user } } = await c.auth.getUser();
      if (!user) return null;
      const { data, error } = await c.from('profiles').select('organization_id, full_name, role, organizations(*)').eq('id', user.id).maybeSingle();
      if (error) throw error;
      return data || null;
    },
    async subscription() {
      const c = await getClient();
      const org = await this.organization();
      if (!org?.organization_id) return null;
      const { data, error } = await c.from('subscriptions').select('*, plans(*)').eq('organization_id', org.organization_id).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (error) throw error;
      return data || null;
    },
    async canAccess() {
      const c = await getClient();
      const { data, error } = await c.rpc('can_access_gestorpro');
      if (error) throw error;
      return !!data;
    }
  };

  getClient().then(() => window.dispatchEvent(new Event('gestorpro:supabase-ready'))).catch(err => console.error('GestorPro Supabase:', err));
})();
