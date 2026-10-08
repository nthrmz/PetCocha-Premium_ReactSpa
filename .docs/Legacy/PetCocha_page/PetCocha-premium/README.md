# PetCocha · versión premium
Versión HTML/CSS/JavaScript previa a la migración a React. Abre index.html directamente o ejecuta `python -m http.server 8000` desde esta carpeta y visita http://localhost:8000. No necesita npm ni dependencias externas.

## Organización
- index.html: secciones y elementos semánticos.
- css/styles.css: paleta, diseño responsive, estados y movimiento reducido.
- js/products.js: catálogo separado de la interfaz.
- js/store.js: estado del carrito, cantidades y persistencia local sin datos personales.
- js/app.js: filtros, renderizado, navegación, cursor y formularios.
- assets/img: recursos aportados por la autora; se conservaron todos.

## Alcance y edición
Los precios son demostrativos. Sustituirlos en products.js. Los nombres se dedujeron de las imágenes y deben verificarse con el producto exacto antes de un uso comercial. No se inventaron pesos de envases ni direcciones, horarios o redes. El formulario valida y muestra revisión y confirmación local con código; no realiza envíos externos, no procesa pagos y no guarda datos personales. El carrito sí se conserva en localStorage. No hay promociones de descuento sin lógica correspondiente.

No se aportó el código fuente del anterior hito: se reconstruyó su lenguaje visual a partir de la página revisada, con los logos y fotos suministrados. El cursor de corazón con seguimiento suave es una recreación, no una copia exacta del anterior. Usa el cursor nativo para conservar la usabilidad.

## Próxima migración a React
Separar Layout/Header/Footer, Hero, CategoryCard, ProductCard, CatalogFilters, CartDialog, GuideForm, ContactForm y ConfirmationDialog. Llevar store.js a un contexto o reducer. Convertir las secciones a rutas Inicio, Productos, Guía y Contacto. Esta entrega utiliza anclas; todavía no incluye React ni rutas SPA y por sí sola no acredita esos criterios del Hito 3.

## Registro de IA
Se utilizó asistencia de IA para implementar estructura, estilos y comportamiento. Decisiones: mantener azul oscuro #102A43, turquesa #16B6A7 y coral #FF7966; separar datos y estado; usar fotos completas en tarjetas; validar y revisar solicitudes sin envío externo. La autora debe revisar nombres, precios, derechos de uso de las fotos y adaptar el proyecto. Las fuentes/licencias de las fotos no venían en el ZIP.

## Validación realizada
Se verificó la sintaxis de JavaScript, las referencias de recursos locales y el estado del carrito (añadir, incrementar, reducir, eliminar, límite y limpiar). Se ejecutó una comprobación de DOM con catálogo, filtros, búsqueda sin resultados, cargar más, carrito, revisión, confirmación, bloqueo de pedido vacío y menú. La comprobación visual en navegador no pudo completarse porque no estaba disponible el ejecutable y la descarga no produjo un archivo válido. El CSS incluye diseños para escritorio, tablet y móvil, pero debe comprobarse visualmente al abrir index.html. No se presenta esta validación como prueba visual ni como evaluación del licenciado.

## Actualización visual
Se retiró la franja superior. Portada a ancho completo con la nueva fotografía del perro y una capa azul oscuro transparente. Tipografías Google Fonts: Manrope para títulos y DM Sans para cuerpo; requieren conexión, con Arial como alternativa. Animaciones de entrada y acercamiento sutil con soporte de movimiento reducido. Imagen vertical de contacto completa mediante object-fit: contain. El pie inferior conserva únicamente el crédito de Nathalie Ramírez. Se recuperaron los datos visibles de la web anterior: Cochabamba, Bolivia, atención Lun–Sáb 09:00–18:00 y respuesta durante el mismo día hábil. No se encontró dirección de calle. Se repitió satisfactoriamente la comprobación de interacciones DOM tras estos cambios; continúa pendiente la revisión visual en navegador.

## Funcionalidad adicional: comparador
Marca «Comparar» en 2 o 3 productos y abre «Comparar selección». La tabla muestra fotos, nombres, categoría, mascota y precio; permite añadir directamente al carrito. La selección se mantiene al filtrar durante la sesión, puede limpiarse y se limita a 3 productos. No compara atributos nutricionales que no están documentados. Se verificaron mínimo, máximo, columnas, conservación entre filtros, añadir al carrito, limpiar y flujo de confirmación en DOM.

Último ajuste visual: Fredoka para títulos y DM Sans para texto. Portada con texto a la izquierda y fotografía del perro a la derecha sin superposición del texto; degradado en el borde. En móvil, texto sobre bloque oscuro y fotografía debajo. Se eliminó «Respuesta» del footer. El cursor de corazón permanece. Sigue pendiente la revisión visual en navegador.
