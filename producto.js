const detailNotice = document.querySelector('#detail-notice');
const detailLayout = document.querySelector('#detail-layout');
const detailImage = document.querySelector('#detail-image');
const thumbnailList = document.querySelector('#detail-thumbnails');
const infoDialog = document.querySelector('#quote-info-dialog');
const formDialog = document.querySelector('#quote-form-dialog');
const quoteForm = document.querySelector('#quote-form');
const acceptTerms = document.querySelector('#accept-terms');
const sendButton = document.querySelector('#send-quote');
const config = window.ARTE_QUE_NACE_CONFIG || {};
const isDemo = location.protocol === 'file:' || (config.catalogMode || config.mode) !== 'live';
const quotesEnabled = !isDemo && (config.quoteMode || config.mode) === 'live';

let currentProduct;
let currentTerms;
let acceptedVersion;
let requestId;
let turnstileToken = '';
let turnstileWidget;

function notice(text, error = false) {
  detailNotice.hidden = !text;
  detailNotice.textContent = text;
  detailNotice.classList.toggle('is-error', error);
}

function formError(text, target = '#quote-form-error') {
  const node = document.querySelector(target);
  node.hidden = !text;
  node.textContent = text;
}

function showImage(image) {
  detailImage.src = image.url;
  detailImage.alt = image.alt || '';
  thumbnailList.querySelectorAll('button').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.imageUrl === image.url));
  });
}

function render(product) {
  currentProduct = product;
  const isPackage = product.kind === 'package';
  document.title = `${product.title} | Arte que Nace`;
  document.querySelector('#detail-title').textContent = product.title;
  document.querySelector('#detail-summary').textContent = product.summary || '';
  document.querySelector('#detail-availability').textContent = isDemo ? 'Vista de ejemplo' : 'Hecho a tu medida';
  document.querySelector('#detail-description').textContent = product.description || '';
  const contactButton = document.querySelector('#detail-contact');
  contactButton.textContent = quotesEnabled
    ? (isPackage ? 'Cotizar este paquete' : 'Cotizar esta pieza')
    : 'Cotizaciones en línea próximamente';
  contactButton.disabled = !quotesEnabled;
  document.querySelector('.detail-footnote').textContent = quotesEnabled
    ? 'Solicitar una cotización no es una compra ni un compromiso de pago. El taller te contactará para confirmar los detalles.'
    : 'Puedes explorar el catálogo; el formulario de cotizaciones en línea se habilitará más adelante.';
  document.querySelector('#quote-info-title').textContent = isPackage
    ? 'Cada paquete se cotiza a tu medida' : 'Cada pieza se cotiza a tu medida';
  document.querySelector('#quote-explanation').textContent = isPackage
    ? 'El importe depende de los artículos incluidos, sus tamaños, la calidad y colores de la lana, la complejidad y los acabados como el enmarcado cuando corresponda. Cuéntanos lo que necesitas y te responderemos personalmente.'
    : 'El importe depende del tamaño, la calidad y los colores de la lana, la complejidad del diseño y si deseas el cuadro enmarcado o sin enmarcar. Cuéntanos lo que tienes en mente y te responderemos personalmente.';
  const included = document.querySelector('#detail-included');
  const includedList = document.querySelector('#detail-included-list');
  includedList.replaceChildren();
  for (const item of product.items || []) {
    const line = document.createElement('li');
    line.textContent = item.title;
    includedList.append(line);
  }
  included.hidden = !isPackage || !includedList.childElementCount;
  const images = product.images || (product.image_url ? [{ url: product.image_url, alt: product.image_alt }] : []);
  thumbnailList.replaceChildren();
  if (images.length) {
    showImage(images[0]);
    for (const image of images) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.imageUrl = image.url;
      button.setAttribute('aria-label', `Ver imagen: ${image.alt || product.title}`);
      button.setAttribute('aria-pressed', String(image === images[0]));
      const thumbnail = document.createElement('img');
      thumbnail.src = image.url;
      thumbnail.alt = '';
      button.append(thumbnail);
      button.addEventListener('click', () => showImage(image));
      thumbnailList.append(button);
    }
  } else {
    detailImage.removeAttribute('src');
    detailImage.alt = 'Imagen pendiente de publicar';
  }
  detailLayout.hidden = false;
}

async function loadTerms() {
  if (!quotesEnabled) {
    return {
      version: 0,
      terms_text: 'VISTA DE DEMOSTRACIÓN. El negocio debe redactar y publicar desde el panel sus términos reales antes de recibir solicitudes. Estos términos de muestra no habilitan el envío de información.',
    };
  }
  const { getSupabase } = await import('./supabase-client.js');
  const { data, error } = await getSupabase().from('quote_settings')
    .select('version,terms_text').eq('id', true).maybeSingle();
  if (error) throw error;
  return data;
}

async function openQuoteInfo() {
  if (!currentProduct || !quotesEnabled) return;
  currentTerms = null;
  acceptedVersion = null;
  acceptTerms.checked = false;
  acceptTerms.disabled = true;
  formError('', '#quote-info-error');
  document.querySelector('#quote-terms-text').textContent = 'Cargando términos y condiciones...';
  document.querySelector('#quote-terms-version').textContent = '';
  infoDialog.showModal();
  try {
    currentTerms = await loadTerms();
    if (!currentTerms) {
      document.querySelector('#quote-terms-text').textContent = 'Aún no se han publicado términos y condiciones para las cotizaciones.';
      formError('Por ahora no es posible enviar una solicitud. Contacta al taller directamente.', '#quote-info-error');
      return;
    }
    document.querySelector('#quote-terms-text').textContent = currentTerms.terms_text;
    document.querySelector('#quote-terms-version').textContent = `Versión ${currentTerms.version}`;
    acceptTerms.disabled = false;
  } catch (error) {
    console.error(error);
    document.querySelector('#quote-terms-text').textContent = 'No se pudieron cargar los términos.';
    formError('Inténtalo de nuevo más tarde.', '#quote-info-error');
  }
}

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('No se pudo cargar la verificación antispam.'));
    document.head.append(script);
  });
}

async function prepareTurnstile() {
  if (!quotesEnabled) {
    sendButton.disabled = true;
    formError('Las cotizaciones en línea todavía no están habilitadas.');
    return;
  }
  const siteKey = window.ARTE_QUE_NACE_CONFIG?.turnstileSiteKey;
  if (!siteKey) {
    sendButton.disabled = true;
    formError('El formulario aún no está configurado para recibir solicitudes.');
    return;
  }
  await loadTurnstileScript();
  turnstileToken = '';
  if (turnstileWidget != null) window.turnstile.remove(turnstileWidget);
  turnstileWidget = window.turnstile.render('#turnstile-container', {
    sitekey: siteKey,
    callback: (token) => { turnstileToken = token; formError(''); },
    'expired-callback': () => { turnstileToken = ''; },
    'error-callback': () => { turnstileToken = ''; formError('No se completó la verificación antispam.'); },
  });
  sendButton.disabled = false;
}

async function continueToForm() {
  if (!currentTerms || !acceptTerms.checked) return;
  acceptedVersion = currentTerms.version;
  requestId = crypto.randomUUID();
  quoteForm.reset();
  document.querySelector('#quote-success').hidden = true;
  quoteForm.hidden = false;
  document.querySelector('#quote-product-name').textContent = `${currentProduct.kind === 'package' ? 'Paquete' : 'Artículo'}: ${currentProduct.title}`;
  formError('');
  infoDialog.close();
  formDialog.showModal();
  try { await prepareTurnstile(); }
  catch (error) { console.error(error); sendButton.disabled = true; formError(error.message); }
}

function numberOrNull(value) {
  return value === '' ? null : Number(value);
}

async function submitQuote(event) {
  event.preventDefault();
  if (!quotesEnabled || !currentProduct || !acceptedVersion) return;
  const values = new FormData(quoteForm);
  const width = numberOrNull(String(values.get('width_cm')).trim());
  const height = numberOrNull(String(values.get('height_cm')).trim());
  if ((width === null) !== (height === null)) {
    formError('Indica tanto el ancho como el alto, o deja ambos campos vacíos.');
    return;
  }
  if (!turnstileToken) {
    formError('Completa la verificación antispam antes de enviar.');
    return;
  }
  sendButton.disabled = true;
  formError('');
  try {
    const { getSupabase } = await import('./supabase-client.js');
    const { data, error } = await getSupabase().functions.invoke('submit-quote', {
      body: {
        id: requestId, item_type: currentProduct.kind === 'package' ? 'package' : 'product',
        product_id: currentProduct.kind === 'package' ? null : currentProduct.id,
        package_id: currentProduct.kind === 'package' ? currentProduct.id : null,
        terms_version: acceptedVersion,
        accepted: true, turnstile_token: turnstileToken,
        website: String(values.get('website') || ''),
        full_name: String(values.get('full_name')).trim(),
        phone: String(values.get('phone')).trim(),
        email: String(values.get('email')).trim(),
        contact_preference: String(values.get('contact_preference')),
        quantity: Number(values.get('quantity')),
        width_cm: width, height_cm: height,
        framing: String(values.get('framing')),
        wool_quality: String(values.get('wool_quality')),
        colors: String(values.get('colors')).trim(),
        needed_by: String(values.get('needed_by')) || null,
        notes: String(values.get('notes')).trim(),
      },
    });
    if (error) {
      let detail = 'No se pudo enviar. Inténtalo de nuevo.';
      try { detail = (await error.context.json()).message || detail; } catch { /* Sin cuerpo JSON. */ }
      throw new Error(detail);
    }
    quoteForm.hidden = true;
    const success = document.querySelector('#quote-success');
    success.hidden = false;
    success.textContent = data?.notification_status === 'sent'
      ? `Solicitud registrada con referencia ${requestId}. Se envió un aviso por correo al taller y te contactarán. Aún no es una compra ni una cotización con precio o fecha confirmados.`
      : `Solicitud registrada con referencia ${requestId}. El aviso por correo está pendiente; el taller podrá verla en el panel. Si es urgente, escríbele por WhatsApp. Aún no es una compra ni una cotización con precio o fecha confirmados.`;
  } catch (error) {
    console.error(error);
    formError(error.message || 'No se pudo enviar la solicitud.');
    sendButton.disabled = false;
    turnstileToken = '';
    if (window.turnstile && turnstileWidget != null) window.turnstile.reset(turnstileWidget);
  }
}

document.querySelector('#detail-contact').addEventListener('click', openQuoteInfo);
acceptTerms.addEventListener('change', () => { if (currentTerms && acceptTerms.checked) continueToForm(); });
quoteForm.addEventListener('submit', submitQuote);
document.querySelectorAll('[data-close-dialog]').forEach((button) => {
  button.addEventListener('click', () => button.closest('dialog').close());
});

async function start() {
  const slug = new URLSearchParams(location.search).get('slug');
  const type = new URLSearchParams(location.search).get('tipo') === 'paquete' ? 'package' : 'product';
  if (!slug) {
    notice('No se indicó una pieza. Vuelve a la colección y selecciona una.', true);
    return;
  }
  notice('Cargando pieza...');
  try {
    let product;
    if (isDemo) {
      product = window.ARTE_QUE_NACE_DEMO[type === 'package' ? 'packages' : 'products']
        .find((item) => item.slug === slug);
    } else {
      const { loadProduct, loadPackage } = await import('./catalog-data.js?v=catalog-live-2');
      product = type === 'package' ? await loadPackage(slug) : await loadProduct(slug);
    }
    if (!product) {
      notice('Esta pieza no está disponible en el catálogo.', true);
      return;
    }
    notice(isDemo
      ? 'Vista demostrativa: este artículo o paquete es un ejemplo.'
      : quotesEnabled ? '' : 'Catálogo real: las solicitudes de cotización en línea aún no están habilitadas.');
    render({ ...product, kind: type });
  } catch (error) {
    console.error('No se pudo cargar la pieza', error);
    notice('No se pudo cargar esta pieza. Inténtalo de nuevo más tarde.', true);
  }
}

start();
