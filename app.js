const buttons = [...document.querySelectorAll('.category-button')];
const status = document.querySelector('#category-status');

function selectCategory(name) {
  buttons.forEach((button) => {
    const selected = button.dataset.category === name;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  status.textContent = `${name} seleccionada`;
}

buttons.forEach((button) => button.addEventListener('click', () => selectCategory(button.dataset.category)));

const slides = [...document.querySelectorAll('.gallery-slide')];
const gallery = document.querySelector('.hero-gallery');
const slideCount = document.querySelector('.gallery-count');
let activeSlide = 0;

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

if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.setInterval(() => showSlide(activeSlide + 1), 6000);
}
