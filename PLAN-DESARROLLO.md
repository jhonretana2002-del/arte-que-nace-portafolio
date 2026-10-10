# Plan de desarrollo vigente — Arte que Nace

La única guía de implementación vigente es [`guia-desarrollo-cotizaciones-arte-que-nace.pdf`](output/pdf/guia-desarrollo-cotizaciones-arte-que-nace.pdf). Este archivo resume su secuencia y el estado **comprobado localmente**.

## Decisión de base de datos

- **Ahora:** usar Supabase (PostgreSQL, autenticación y almacenamiento) para llevar el panel de demo a un entorno alfa de ensayo. La organización gratuita «Arte que Nace» y el proyecto «Arte que Nace - ensayo» ya están creados. En el desarrollo local, la URL y la clave publicable del proyecto están en `site-config.js`, pero todavía no se han aplicado las migraciones ni configurado una cuenta administradora.
- **Más adelante:** evaluar migración a MySQL/MariaDB solo si resulta conveniente al elegir el servidor definitivo. No será un cambio de URL ni una conversión automática de los archivos `.sql` actuales: habrá que adaptar esquema, API, autenticación, archivos, funciones de cotización y pruebas. Cambiar de alojamiento web no obliga por sí solo a migrar desde Supabase.
- **Hasta entonces:** no activar `mode: 'live'` ni afirmar que el panel guarda datos reales antes de aplicar migraciones y completar pruebas de permisos en el proyecto de ensayo.

## Fase 1 de 3 — Panel privado y catálogo ordenable

Objetivo: administrar categorías, artículos y paquetes sin precios, con publicación controlada y vista pública por categoría.

- [x] Código local de formularios para crear y editar categorías, artículos y paquetes.
- [x] Código local de ocultación/publicación, orden, imágenes y relaciones de paquetes.
- [x] Código local de búsqueda y filtros opcionales en listas administrativas.
- [x] Vista preliminar portátil para buscar, filtrar y previsualizar ejemplos sin guardar cambios.
- [ ] Conectar un proyecto Supabase de ensayo con cuenta administradora y migraciones aplicadas.
- [ ] Probar de verdad permisos RLS/Storage con visitante, usuario sin rol y administrador.
- [ ] Crear, editar, ordenar, publicar y ocultar contenido real desde el panel; verificar que persiste y que la vista pública coincide.
- [ ] Hacer la prueba autónoma de la dueña y documentar resultados.

**Estado:** fase 1 aún abierta. La presencia de código no sustituye la prueba conectada.

## Fase 2 de 3 — Cotizaciones operables

Objetivo: consentimiento versionado, solicitud sin precio, almacenamiento fiable, aviso y bandeja de seguimiento.

- [x] Código local del formulario, términos versionados, función de envío y bandeja administrativa.
- [ ] Aprobar textos legales y destinatario real.
- [ ] Configurar correo y antispam en ensayo, sin secretos en el navegador.
- [ ] Probar envíos de artículo y paquete, duplicados, fallo de correo, cambio de términos y cuenta no autorizada.

**Estado:** implementación local avanzada; no hay flujo extremo a extremo validado.

## Fase 3 de 3 — Lanzamiento y operación

Objetivo: publicar en HTTPS con seguridad, respaldos restaurables, manual operativo y aceptación del negocio.

- [ ] Separar ensayo y producción, definir dominio, hospedaje y responsables.
- [ ] Aplicar migraciones con respaldo y restauración de prueba.
- [ ] Ejecutar pruebas finales de seguridad, accesibilidad, móvil, contingencia y entrega de correo.
- [ ] Cargar contenido real, entregar manual y obtener aprobación de la dueña.

**Estado:** no iniciada como salida a producción.

## Próxima puerta de salida

No pasar de la fase 1 a la 2 como fase **verificada** hasta que exista un entorno de ensayo conectado y se demuestre: acceso administrativo, permisos de cada rol, orden persistente, un paquete publicado con artículos y una ficha pública sin precio. En el desarrollo local, `site-config.js` sigue en modo `demo`, que no permite guardar cambios ni recibir cotizaciones reales. El código del panel aún no forma parte de la versión pública de este repositorio.
