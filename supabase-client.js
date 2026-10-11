import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm';

let adminClient;
let publicClient;

export function getSupabase({ admin = false } = {}) {
  const config = window.ARTE_QUE_NACE_CONFIG;
  const enabled = admin ? (config?.adminMode || config?.mode) === 'live'
    : (config?.catalogMode || config?.mode) === 'live';
  if (!enabled || !config.supabaseUrl || !config.supabasePublishableKey) {
    throw new Error('La tienda en línea todavía no está configurada. Revisa site-config.js.');
  }
  if (admin) {
    if (!adminClient) adminClient = createClient(config.supabaseUrl, config.supabasePublishableKey);
    return adminClient;
  }
  // La tienda no debe heredar la sesión del panel: RLS daría al administrador
  // acceso a categorías y borradores ocultos también en la vista pública.
  if (!publicClient) {
    publicClient = createClient(config.supabaseUrl, config.supabasePublishableKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return publicClient;
}

export async function signedImageUrl(path, options = {}) {
  const { data, error } = await getSupabase(options)
    .storage.from(window.ARTE_QUE_NACE_CONFIG.storageBucket || 'product-images')
    .createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
