import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.1/+esm';

let adminClient;
let publicClient;
const signedImageCache = new Map();

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

export async function signedImageUrls(paths) {
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  const now = Date.now();
  const missingPaths = uniquePaths.filter((path) => {
    const cached = signedImageCache.get(path);
    return !cached || cached.expiresAt <= now;
  });

  if (missingPaths.length) {
    const { data, error } = await getSupabase()
      .storage.from(window.ARTE_QUE_NACE_CONFIG.storageBucket || 'product-images')
      .createSignedUrls(missingPaths, 3600);
    if (error) throw error;
    const expiresAt = Date.now() + 55 * 60 * 1000;
    for (const item of data || []) {
      if (item.path && item.signedUrl && !item.error) {
        signedImageCache.set(item.path, { url: item.signedUrl, expiresAt });
      }
    }
  }

  return new Map(uniquePaths.flatMap((path) => {
    const cached = signedImageCache.get(path);
    return cached && cached.expiresAt > Date.now() ? [[path, cached.url]] : [];
  }));
}
