const buttons = [...document.querySelectorAll('.category-button')];
const status = document.querySelector('#category-status');
const mobileCategoryTrigger = document.querySelector('#mobile-category-trigger');
const mobileCategoryLabel = document.querySelector('#mobile-category-label');
const categoryPanel = document.querySelector('#category-panel');
const panelButtons = document.querySelector('#panel-buttons');

const categoryChoices = buttons.map((source) => {
  const choice = document.createElement('button');
  choice.type = 'button';
  choice.className = 'panel-category';
  choice.dataset.category = source.dataset.category;
  choice.textContent = source.dataset.category;
  choice.addEventListener('click', () => {
    selectCategory(choice.dataset.category);
    categoryPanel.close();
  });
  panelButtons.append(choice);
  return choice;
});

function selectCategory(name) {
  buttons.forEach((button) => {
    const selected = button.dataset.category === name;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  status.textContent = `${name} seleccionada`;
  mobileCategoryLabel.textContent = name;
  categoryChoices.forEach((choice) => {
    const selected = choice.dataset.category === name;
    choice.classList.toggle('is-active', selected);
    choice.setAttribute('aria-pressed', String(selected));
  });
}

buttons.forEach((button) => button.addEventListener('click', () => selectCategory(button.dataset.category)));
mobileCategoryTrigger.addEventListener('click', () => {
  categoryPanel.showModal();
  mobileCategoryTrigger.setAttribute('aria-expanded', 'true');
  categoryChoices.find((choice) => choice.classList.contains('is-active'))?.focus();
});
document.querySelector('#close-panel').addEventListener('click', () => categoryPanel.close());
categoryPanel.addEventListener('close', () => mobileCategoryTrigger.setAttribute('aria-expanded', 'false'));
categoryPanel.addEventListener('click', (event) => {
  if (event.target === categoryPanel) categoryPanel.close();
});
selectCategory('Navidad');

const slides = [...document.querySelectorAll('.gallery-slide')];
const gallery = document.querySelector('.hero-gallery');
const slideCount = document.querySelector('.gallery-count');
let activeSlide = 0;
let slideTimer;

// Ajusta cada foto al mismo marco sin recortar la obra ni dejar aire dentro de su máscara.
function fitGalleryImages() {
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
new ResizeObserver(fitGalleryImages).observe(gallery);
fitGalleryImages();

function showSlide(index) {
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

let touchStart = null;
gallery.addEventListener('touchstart', (event) => {
  if (event.touches.length !== 1) return;
  touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
}, { passive: true });
gallery.addEventListener('touchend', (event) => {
  if (!touchStart || event.changedTouches.length !== 1) return;
  const deltaX = event.changedTouches[0].clientX - touchStart.x;
  const deltaY = event.changedTouches[0].clientY - touchStart.y;
  touchStart = null;
  if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
    stepSlide(deltaX < 0 ? 1 : -1);
  }
}, { passive: true });
gallery.addEventListener('touchcancel', () => { touchStart = null; });
restartSlideTimer();
