// Esta clave publicable se puede ver en el navegador. Nunca coloques aquí
// la service_role key ni las claves privadas de Resend o Turnstile.
// El catálogo público lee los artículos publicados del proyecto de ensayo.
// Las cotizaciones en línea permanecen deshabilitadas hasta comprobar
// correo, antispam y permisos. El panel se activa por separado.
window.ARTE_QUE_NACE_CONFIG = Object.freeze({
  mode: 'demo',
  catalogMode: 'live',
  quoteMode: 'disabled',
  adminMode: 'live',
  supabaseUrl: 'https://tcvcmwhrppzktohlbvcn.supabase.co',
  supabasePublishableKey: 'sb_publishable_dfSQO9i30DARbkDzipSPrw_MekFQKfO',
  storageBucket: 'product-images',
  turnstileSiteKey: '',
});
