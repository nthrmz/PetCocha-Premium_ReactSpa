# PetCocha

SPA de PetCocha construida con React 19 y Vite 8. La interfaz conserva el catálogo y el lenguaje visual de la versión Legacy; el carrito se guarda localmente en el navegador. El formulario prepara una solicitud local para revisión: no procesa pagos ni la envía a un servidor.

## Requisitos

- Node.js 20.19+ o 22.12+
- npm

## Instalación y desarrollo

Desde la raíz del proyecto:

```bash
npm ci
npm run dev
```

Vite muestra la dirección local, normalmente `http://localhost:5173/`. En desarrollo, los assets se sirven desde la raíz. La compilación usa la base `/PetCocha-Premium_ReactSpa/` para GitHub Pages.

## Comprobaciones y compilación

```bash
npm run lint
npm run build
npm run preview
```

El proyecto no define actualmente pruebas automatizadas ni un comando `typecheck`; la interfaz está escrita en JavaScript/JSX. `dist/` contiene el resultado de producción y no se versiona.

## Rutas

La navegación usa el hash nativo para que las rutas directas y su recarga funcionen en GitHub Pages sin una regla de fallback del servidor:

- `/#/inicio`
- `/#/productos`
- `/#/nosotros`
- `/#/elige-mejor`
- `/#/contacto`

Productos también acepta filtros en la URL, por ejemplo `/#/productos?categoria=Juguetes`. Atrás y Adelante del navegador recorren las vistas. Las rutas desconocidas muestran la vista 404.

## Estructura

- `src/App.jsx`: estado compartido, navegación hash, filtros y flujos del carrito, comparador y formulario.
- `src/components/Header.jsx`: cabecera y menú adaptable.
- `src/components/ProductCatalog.jsx`: búsqueda, filtros, productos y controles del comparador.
- `src/components/ContentSections.jsx`: contenido de Inicio, Nosotros, Elige mejor, Contacto, categorías y pie común.
- `src/components/Dialogs.jsx`: diálogos del carrito, comparación y confirmación.
- `src/data/products.js`: catálogo y construcción de URL de imágenes.
- `src/petcocha.css`: estilos de PetCocha.
- `public/assets/img/`: imágenes y logos utilizados por la aplicación.
- `.docs/Legacy/PetCocha_page/PetCocha-premium/`: fuente de referencia conservada sin modificaciones.
- `.docs/Liberia-de-Componentes/`: carpeta de referencia para documentación de componentes; está vacía mientras no se aporte documentación.

## GitHub Pages

El workflow `.github/workflows/deploy.yml` compila y publica `main` mediante GitHub Actions al subir cambios o al ejecutarlo manualmente. También configura GitHub Pages con `actions/configure-pages`. El sitio se servirá bajo `https://nthrmz.github.io/PetCocha-Premium_ReactSpa/`.

Para publicar:

1. Sube cambios a `main` o ejecuta manualmente **Deploy to GitHub Pages** desde Actions.
2. Comprueba el resultado del workflow antes de compartir el sitio.

No se requieren secretos de publicación configurados manualmente: el workflow usa el token de GitHub Actions con permisos de Pages.
