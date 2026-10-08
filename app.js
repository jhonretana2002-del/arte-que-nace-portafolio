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
const slideCount = document.querySelector('.gallery-count');
let activeSlide = 0;

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
