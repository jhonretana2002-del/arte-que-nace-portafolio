const mobileCategoryTrigger = document.querySelector('#mobile-category-trigger');
const mobileCategoryLabel = document.querySelector('#mobile-category-label');
const mobileCategoryIcon = document.querySelector('.mobile-category-icon');
const categoryPanel = document.querySelector('#category-panel');
const panelButtons = document.querySelector('#panel-buttons');
const categoryNav = document.querySelector('#category-nav');
const categoryStatus = document.querySelector('#category-status');
const productGrid = document.querySelector('#product-grid');
const catalogNotice = document.querySelector('#catalog-notice');
const config = window.ARTE_QUE_NACE_CONFIG || { mode: 'demo' };
const demoMode = location.protocol === 'file:' || (config.catalogMode || config.mode) !== 'live';
const icons = ['✦', '♰', '⌘', '◉', '☷'];

let catalog = { categories: [], products: [], packages: [] };
let activeCategoryId = null;

function setNotice(message, isError = false) {
  catalogNotice.hidden = !message;
  catalogNotice.textContent = message;
  catalogNotice.classList.toggle('is-error', isError);
}

function updateUrl(slug) {
  if (location.protocol === 'file:') return;
  const url = new URL(location.href);
  url.searchParams.set('categoria', slug);
  history.replaceState(null, '', url);
}

function selectCategory(category, syncUrl = true) {
  activeCategoryId = category.id;
  categoryStatus.textContent = `${category.name} seleccionada`;
  for (const button of categoryNav.querySelectorAll('.category-button')) {
    const selected = button.dataset.categoryId === category.id;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  }
  mobileCategoryLabel.textContent = category.name;
  mobileCategoryIcon.textContent = categoryNav.querySelector(`[data-category-id="${category.id}"] .category-icon`)?.textContent || '✦';
  for (const choice of panelButtons.querySelectorAll('.panel-category')) {
    const selected = choice.dataset.categoryId === category.id;
    choice.classList.toggle('is-active', selected);
    choice.setAttribute('aria-pressed', String(selected));
  }
  if (syncUrl) updateUrl(category.slug);
  renderProducts();
}

function renderCategories() {
  categoryNav.replaceChildren();
  panelButtons.replaceChildren();
  const byPosition = (a, b) => a.position - b.position || a.name.localeCompare(b.name, 'es');
  const roots = catalog.categories.filter((item) => !item.parent_id).sort(byPosition);
  const categories = roots.flatMap((root) => [root,
    ...catalog.categories.filter((item) => item.parent_id === root.id).sort(byPosition)]);
  categories.forEach((category, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'category-button';
    button.dataset.categoryId = category.id;
    button.setAttribute('aria-pressed', 'false');
    if (category.parent_id) button.classList.add('is-subcategory');

    const icon = document.createElement('span');
    icon.className = 'category-icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = icons[index % icons.length];
    const label = document.createElement('span');
    label.className = 'category-label';
    label.textContent = category.name;
    const chevron = document.createElement('span');
    chevron.className = 'category-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '›';
    button.append(icon, label, chevron);
    button.addEventListener('click', () => selectCategory(category));
    categoryNav.append(button);
    const choice = document.createElement('button');
    choice.type = 'button';
    choice.className = 'panel-category';
    choice.dataset.categoryId = category.id;
    choice.textContent = category.name;
    choice.setAttribute('aria-pressed', 'false');
    choice.addEventListener('click', () => {
      selectCategory(category);
      categoryPanel.close();
    });
    panelButtons.append(choice);
  });

  const requestedSlug = new URLSearchParams(location.search).get('categoria');
  const selected = categories.find((category) => category.slug === requestedSlug) || categories[0];
  if (selected) selectCategory(selected, false);
  else {
    categoryStatus.textContent = 'Sin categorías publicadas';
    renderProducts();
  }
}

mobileCategoryTrigger.addEventListener('click', () => {
  categoryPanel.showModal();
  mobileCategoryTrigger.setAttribute('aria-expanded', 'true');
  panelButtons.querySelector('.panel-category.is-active')?.focus();
});
document.querySelector('#close-panel').addEventListener('click', () => categoryPanel.close());
categoryPanel.addEventListener('close', () => mobileCategoryTrigger.setAttribute('aria-expanded', 'false'));
categoryPanel.addEventListener('click', (event) => {
  if (event.target === categoryPanel) categoryPanel.close();
});

function productCard(product) {
  const isPackage = product.kind === 'package';
  const article = document.createElement('article');
  article.className = 'product-card';
  const link = document.createElement('a');
  link.className = 'product-link';
  link.href = `producto.html?${isPackage ? 'tipo=paquete&' : ''}slug=${encodeURIComponent(product.slug)}`;
  link.setAttribute('aria-label', `Ver ${product.title}`);

  const visual = document.createElement('div');
  visual.className = 'product-visual';
  if (product.image_url) {
    const image = document.createElement('img');
    image.src = product.image_url;
    image.alt = product.image_alt || product.title;
    image.loading = 'lazy';
    visual.append(image);
  }
  const info = document.createElement('div');
  info.className = 'product-info';
  const copy = document.createElement('div');
  const title = document.createElement('h3');
  title.textContent = product.title;
  const summary = document.createElement('p');
  summary.textContent = product.summary || 'Hecho a tu medida';
  const price = document.createElement('strong');
  price.className = 'product-price';
  price.textContent = isPackage ? 'Paquete · Cotización personalizada' : 'Cotización personalizada';
  const arrow = document.createElement('span');
  arrow.className = 'product-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '↗';
  copy.append(title, summary, price);
  info.append(copy, arrow);
  link.append(visual, info);
  article.append(link);
  return article;
}

function renderProducts() {
  productGrid.replaceChildren();
  if (!activeCategoryId) {
    const empty = document.createElement('p');
    empty.className = 'catalog-empty';
    empty.textContent = 'Todavía no hay categorías publicadas.';
    productGrid.append(empty);
    return;
  }
  const visibleCategoryIds = new Set([activeCategoryId]);
  for (const category of catalog.categories) {
    if (category.parent_id === activeCategoryId) visibleCategoryIds.add(category.id);
  }
  const products = [
    ...catalog.products.map((item) => ({ ...item, kind: 'product' })),
    ...(catalog.packages || []).map((item) => ({ ...item, kind: 'package' })),
  ].filter((item) => visibleCategoryIds.has(item.category_id))
    .sort((a, b) => a.position - b.position || a.title.localeCompare(b.title, 'es'));
  if (!products.length) {
    const empty = document.createElement('p');
    empty.className = 'catalog-empty';
    empty.textContent = 'Aún no hay piezas en esta categoría. Puedes solicitar una cotización personalizada.';
    productGrid.append(empty);
    return;
  }
  productGrid.append(...products.map(productCard));
}

async function startCatalog() {
  if (demoMode) {
    catalog = window.ARTE_QUE_NACE_DEMO;
    setNotice('Vista demostrativa: estas piezas son ejemplos y se cotizan de forma personalizada.');
    renderCategories();
    return;
  }
  setNotice('Cargando catálogo...');
  try {
    const { loadCatalog } = await import('./catalog-data.js?v=catalog-live-2');
    catalog = await loadCatalog();
    setNotice('');
    renderCategories();
  } catch (error) {
    console.error('No se pudo cargar el catálogo', error);
    setNotice('No se pudo cargar el catálogo. Inténtalo de nuevo más tarde.', true);
    categoryStatus.textContent = 'Catálogo temporalmente no disponible';
    productGrid.replaceChildren();
  }
}

const slides = [...document.querySelectorAll('.gallery-slide')];
const gallery = document.querySelector('.hero-gallery');
const slideCount = document.querySelector('.gallery-count');
let activeSlide = 0;
let slideTimer;

function fitGalleryImages() {
  if (!gallery) return;
  const { width: frameWidth, height: frameHeight } = gallery.getBoundingClientRect();
  slides.forEach((slide) => {
    const image = slide.querySelector('img');
    if (!image.naturalWidth || !image.naturalHeight) return;
    const ratio = image.naturalWidth / image.naturalHeight;
    const zoom = window.matchMedia('(max-width: 900px)').matches ? 1 : 1.12;
    const width = Math.min(frameWidth, frameHeight * ratio * zoom);
    image.style.width = `${width}px`;
    image.style.height = `${width / ratio}px`;
  });
}

slides.forEach((slide) => slide.querySelector('img').addEventListener('load', fitGalleryImages));
if (gallery && window.ResizeObserver) new ResizeObserver(fitGalleryImages).observe(gallery);
fitGalleryImages();

function showSlide(index) {
  if (!slides.length) return;
  activeSlide = (index + slides.length) % slides.length;
  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === activeSlide;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', String(!active));
  });
  slideCount.textContent = `${String(activeSlide + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
}

showSlide(0);

function restartSlideTimer() {
  window.clearInterval(slideTimer);
  if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    slideTimer = window.setInterval(() => showSlide(activeSlide + 1), 7000);
  }
}

function stepSlide(direction) {
  showSlide(activeSlide + direction);
  restartSlideTimer();
}

document.querySelector('#gallery-prev').addEventListener('click', () => stepSlide(-1));
document.querySelector('#gallery-next').addEventListener('click', () => stepSlide(1));
gallery.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    stepSlide(event.key === 'ArrowLeft' ? -1 : 1);
  }
});

let dragStart = null;
gallery.addEventListener('dragstart', (event) => event.preventDefault());
gallery.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || event.target.closest('.gallery-arrow')) return;
  dragStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
  gallery.setPointerCapture(event.pointerId);
});
gallery.addEventListener('pointerup', (event) => {
  if (!dragStart || event.pointerId !== dragStart.id) return;
  const deltaX = event.clientX - dragStart.x;
  const deltaY = event.clientY - dragStart.y;
  dragStart = null;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
    stepSlide(deltaX < 0 ? 1 : -1);
  }
});
gallery.addEventListener('pointercancel', () => { dragStart = null; });
restartSlideTimer();

startCatalog();
