const categoryDetails = {
  "Navidad": "Detalles hechos a mano para regalar, decorar y celebrar con intención.",
  "Religión": "Piezas con simbolismo y presencia para acompañar momentos especiales.",
  "Video Juegos": "Accesorios y arte para convertir tu universo favorito en algo tangible.",
  "Entretenimiento": "Objetos inspirados en historias, música y personajes que te acompañan.",
  "Cotizaciones": "Cuéntanos tu idea y diseñamos una pieza o pedido especial contigo."
};

const buttons = [...document.querySelectorAll('.category-button')];
const activeCategory = document.querySelector('#active-category');
const description = document.querySelector('#hero-description');
const status = document.querySelector('#category-status');
const dialog = document.querySelector('#category-panel');
const panelButtons = document.querySelector('#panel-buttons');

function selectCategory(name) {
  buttons.forEach((button) => {
    const selected = button.dataset.category === name;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  panelButtons.querySelectorAll('button').forEach((button) => button.classList.toggle('is-active', button.textContent === name));
  activeCategory.textContent = name;
  description.textContent = categoryDetails[name];
  status.textContent = `${name} seleccionada`;
}

buttons.forEach((button) => button.addEventListener('click', () => selectCategory(button.dataset.category)));

Object.keys(categoryDetails).forEach((name) => {
  const button = document.createElement('button');
  button.className = 'panel-category';
  button.type = 'button';
  button.textContent = name;
  button.addEventListener('click', () => { selectCategory(name); dialog.close(); document.querySelector('#coleccion').scrollIntoView({ behavior: 'smooth' }); });
  panelButtons.append(button);
});

document.querySelector('#open-panel').addEventListener('click', () => dialog.showModal());
document.querySelector('#close-panel').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
