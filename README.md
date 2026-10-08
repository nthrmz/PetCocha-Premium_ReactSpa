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

Vite muestra la dirección local, normalmente `http://localhost:5173/PetCocha-Premium_ReactSpa/`. La base `/PetCocha-Premium_ReactSpa/` se usa tanto en desarrollo como en producción.

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

El workflow `.github/workflows/deploy.yml` instala dependencias, ejecuta lint y build, verifica que `dist/index.html` apunte a los bundles compilados y publica únicamente `dist` mediante GitHub Actions al subir cambios a `main` o al ejecutarlo manualmente. El sitio se sirve bajo `https://nthrmz.github.io/PetCocha-Premium_ReactSpa/`.

En GitHub, configura **Settings → Pages → Build and deployment → Source → GitHub Actions**. Si Pages está configurado para publicar desde `main` (raíz o `/docs`), servirá el `index.html` fuente de Vite en lugar de `dist`.

Después, sube cambios a `main` o ejecuta manualmente **Deploy to GitHub Pages** desde Actions y comprueba que el workflow finalice correctamente antes de compartir el sitio.

No se requieren secretos de publicación configurados manualmente: el workflow usa el token de GitHub Actions con permisos de Pages.
