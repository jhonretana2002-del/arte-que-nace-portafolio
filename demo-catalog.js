// Catálogo de vista previa portátil. Ninguna pieza de esta lista está a la venta.
window.ARTE_QUE_NACE_DEMO = Object.freeze({
  categories: [
    { id: 'navidad', name: 'Navidad', slug: 'navidad', position: 10 },
    { id: 'religion', name: 'Religión', slug: 'religion', position: 20 },
    { id: 'video-juegos', name: 'Video Juegos', slug: 'video-juegos', position: 30 },
    { id: 'entretenimiento', name: 'Entretenimiento', slug: 'entretenimiento', position: 40 },
    { id: 'cotizaciones', name: 'Cotizaciones', slug: 'cotizaciones', position: 50 },
  ],
  products: [
    {
      id: 'muestra-bolso-perrito', category_id: 'navidad', slug: 'muestra-bolso-perrito', position: 10,
      title: 'Bolso tejido de muestra', summary: 'Una idea para un regalo hecho a mano.',
      description: 'Este artículo ilustra cómo se verá la ficha de una pieza. Cada solicitud se cotiza según tamaño, materiales y detalles elegidos.',
      image_url: 'assets/bolso-perrito.jpg', image_alt: 'Bolso tejido con la figura de un perro.',
    },
    {
      id: 'muestra-bolso-retrato', category_id: 'navidad', slug: 'muestra-bolso-retrato', position: 20,
      title: 'Retrato textil de muestra', summary: 'Una pieza personalizada para inspirarte.',
      description: 'Vista de ejemplo de un producto personalizado. El taller preparará una cotización individual al conocer tus preferencias.',
      image_url: 'assets/bolso-retrato.jpg', image_alt: 'Bolso tejido con un retrato artístico.',
    },
    {
      id: 'muestra-bolso-tejido', category_id: 'navidad', slug: 'muestra-bolso-tejido', position: 30,
      title: 'Bolso azul de muestra', summary: 'Texturas y color en una pieza portátil.',
      description: 'Ejemplo visual del catálogo portátil; no representa una oferta de venta activa.',
      image_url: 'assets/bolso-tejido.jpg', image_alt: 'Bolso azul tejido a mano.',
    },
    {
      id: 'muestra-canvas', category_id: 'video-juegos', slug: 'muestra-canvas', position: 10,
      title: 'Canvas de muestra', summary: 'Arte textil inspirado en personajes.',
      description: 'Vista de ejemplo para mostrar el formato de una ficha. La cotización depende de las medidas y los acabados.',
      image_url: 'assets/canvas-tortugas.jpg', image_alt: 'Cuadros textiles de personajes sobre una pared.',
    },
    {
      id: 'muestra-catrina', category_id: 'entretenimiento', slug: 'muestra-catrina', position: 10,
      title: 'Catrina textil de muestra', summary: 'Color y detalle tejido a mano.',
      description: 'Ejemplo visual de una obra. Una ficha publicada permitirá solicitar una cotización personalizada.',
      image_url: 'assets/canvas-dia-muertos.jpg', image_alt: 'Cuadro textil de una Catrina.',
    },
  ],
  packages: [
    {
      id: 'muestra-paquete', category_id: 'navidad', slug: 'muestra-paquete', position: 5,
      title: 'Conjunto artesanal de muestra', summary: 'Dos ideas textiles para un regalo personalizado.',
      description: 'Este paquete demuestra cómo se agrupan artículos para recibir una sola solicitud de cotización. La composición, medidas y materiales se confirman con el taller.',
      image_url: 'assets/bolso-perrito.jpg', image_alt: 'Bolso tejido artesanal con figura de perro.',
      items: [
        { title: 'Bolso tejido de muestra', slug: 'muestra-bolso-perrito' },
        { title: 'Retrato textil de muestra', slug: 'muestra-bolso-retrato' },
      ],
    },
  ],
});
