# Plan de desarrollo — Arte que Nace

## Principios de la solución

La tienda se construirá como una aplicación modular, ligera y preparada para crecer. El primer prototipo será un **portafolio portátil**: una carpeta autónoma que se abre desde una PC o celular, sin VPS, instalación, base de datos ni conexión obligatoria. La experiencia pública priorizará HTML estático, CSS y JavaScript mínimo. El servidor se ocupará solamente cuando haga falta: administración, inventario, pedidos, autenticación o integración con pagos.

**Reglas técnicas de base**

- Separar la interfaz pública, el panel administrativo y el servicio de pedidos/pagos.
- Mantener catálogo, categorías, productos y pedidos como módulos independientes; ningún componente debe depender directamente de otro.
- Procesar tarjetas únicamente con una pasarela certificada. La tienda nunca guarda datos de tarjeta.
- Optimizar imágenes antes de publicarlas (WebP/AVIF, tamaños responsivos y carga diferida), usar caché de navegador y comprimir las respuestas del servidor.
- Empezar con una única base de datos relacional (PostgreSQL o MariaDB) y copias de seguridad automáticas. Evitar microservicios durante la primera etapa.

## Fase 1 — Fundaciones, identidad y catálogo navegable

**Objetivo:** tener un portafolio interactivo rápido, coherente y fácil de ampliar, listo para mostrar productos y captar pedidos.

**Alcance**

- Convertir el diseño aprobado en componentes reutilizables: encabezado, menú lateral de categorías, tarjetas de producto, ficha de producto, pie de página, modal y estados de selección.
- Implementar las categorías Navidad, Religión, Video Juegos, Entretenimiento y Cotizaciones. El menú lateral marcará claramente la categoría activa y abrirá sus subcategorías cuando existan.
- Crear las páginas Inicio, Catálogo, ficha de producto, Nosotros y Contacto.
- Incorporar catálogo administrable: nombre, descripción, precio, existencias, imágenes, categoría, variantes y estado de publicación.
- Preparar la versión móvil y accesible: navegación por teclado, etiquetas para lectores de pantalla, contraste suficiente y formularios claros.
- Entregar el portafolio como una carpeta portátil: abrir `index.html` para mostrarlo sin instalar nada o publicarlo posteriormente en cualquier hosting estático.
- Definir, sin implementar todavía, la futura instalación en VPS: dominio, HTTPS, Nginx, firewall, copias de seguridad y monitoreo básico.

**Resultado verificable:** en una PC o celular, el portafolio muestra la marca, permite navegar por categoría, resalta la selección activa y presenta el catálogo conceptual sin depender de un servidor. El mismo código puede publicarse más adelante en un VPS pequeño.

## Fase 2 — Ventas, pagos y operación diaria

**Objetivo:** transformar el catálogo en una tienda operable sin aumentar innecesariamente la complejidad del servidor.

**Alcance**

- Añadir carrito y flujo de compra con validación de stock, datos de envío y resumen del pedido.
- Integrar una pasarela de pago disponible en el país de operación (por ejemplo, tarjeta, PayPal, Mercado Pago o método local). El pago se realiza en la pasarela o con sus campos seguros; el servidor recibe solo el estado del pago mediante webhooks verificados.
- Construir un panel administrativo protegido para productos, inventario, pedidos, clientes y cupones simples.
- Configurar correos transaccionales: confirmación de pedido, pago recibido, cambio de estado y solicitud de cotización.
- Definir entregas: retiro, mensajería local, tarifas por zona o integración con proveedor cuando sea necesaria.
- Crear pruebas de las rutas críticas: agregar al carrito, pagar, descontar inventario, cancelar o reembolsar conforme a la pasarela elegida.

**Resultado verificable:** un cliente completa una compra de prueba de inicio a fin y el administrador puede gestionar el pedido e inventario desde el panel.

## Fase 3 — Escalamiento controlado y mantenimiento

**Objetivo:** sostener el crecimiento sin rehacer la tienda ni sobredimensionar la infraestructura.

**Alcance**

- Añadir búsqueda, filtros, productos relacionados, listas de favoritos y subcategorías solo cuando el catálogo lo justifique.
- Incorporar métricas de rendimiento y conversión respetando privacidad, además de alertas de disponibilidad, errores y copias de seguridad fallidas.
- Mejorar la entrega de contenido: CDN para imágenes, caché de páginas públicas y limpieza programada de datos temporales.
- Definir actualizaciones mensuales de seguridad, recuperación de respaldo probada y registro de cambios.
- Evaluar aumento de recursos únicamente con datos: tráfico, uso de CPU/RAM, tiempos de respuesta y tamaño de imágenes. Si se supera la capacidad del VPS, escalar primero RAM/CPU o mover imágenes a almacenamiento externo antes de dividir servicios.

**Resultado verificable:** la tienda puede crecer en catálogo y tráfico conservando tiempos de carga cortos, recuperación ante fallos y costos predecibles.

## Arquitectura recomendada para un VPS económico

```text
Visitante
    ↓ HTTPS
Nginx (caché, compresión, archivos estáticos)
    ├── Tienda pública estática / renderizada
    ├── API modular de catálogo, pedidos y administración
    └── Pasarela externa de pagos
             ↓ webhook firmado
        API de pedidos
             ↓
      Base de datos relacional + respaldos
```

El prototipo portátil no consume recursos de servidor. Para el lanzamiento real, un VPS inicial con 1–2 vCPU, 2 GB de RAM y almacenamiento SSD puede servir para una tienda pequeña con tráfico moderado si las imágenes se optimizan y los pagos se delegan a una pasarela. La cifra exacta dependerá del catálogo, visitas simultáneas y panel administrativo; se revisará antes del lanzamiento real.

## Decisiones necesarias antes de iniciar la Fase 2

1. País, moneda e impuestos aplicables.
2. Pasarela de pago y métodos deseados.
3. Tipo de entrega y zonas de cobertura.
4. Catálogo inicial: productos, precios, fotografías, existencias y políticas de cambios/devoluciones.
