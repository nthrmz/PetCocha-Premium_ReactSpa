# Configuración de Supabase

## Entorno y paquetes

- Sistema: Windows 10 x64, PowerShell.
- Proyecto: SPA JavaScript/JSX con React 19 y Vite 8; npm es el gestor de paquetes.
- Node.js: 24.19.0; npm: 11.17.0.
- Supabase CLI: `supabase` 3.1.0, instalada como dependencia de desarrollo del proyecto.
- SDK: `@supabase/supabase-js` 2.119.0, instalado como dependencia de ejecución.
- No se instaló ni utilizó Docker.

## Proyecto Supabase Cloud y estado

El Dashboard abierto confirmó el proyecto **PetCocha** de la organización **PetCocha-Plus**:

- Project ref: `vxmjsgbpfmofbcpetgjd`
- URL: `https://vxmjsgbpfmofbcpetgjd.supabase.co`
- Estado mostrado por Cloud: saludable.

`supabase init` se completó y creó `supabase/config.toml`. La autenticación de la CLI se verificó con `npx supabase projects list`: devuelve el proyecto `PetCocha` como `ACTIVE_HEALTHY` y `linked: true`. Antes de cada migración se compara el destino con `vxmjsgbpfmofbcpetgjd`. La migración del catálogo creó `public.products`; la migración de carritos agrega `public.carts` y `public.cart_items`.

La clave API `publishable` se obtuvo del proyecto vinculado con `npx supabase projects api-keys` y se guardó directamente en `.env.local`; su valor no se mostró ni se incluyó en el repositorio. La clave `secret` y la clave heredada `service_role` no se utilizan.

Si necesitas autenticar de nuevo en este equipo, abre una terminal interactiva en la raíz y ejecuta:

```powershell
npx supabase login
npx supabase projects list
```

Si la CLI solicita un access token, créalo en Supabase Dashboard → Account → Access Tokens e introdúcelo directamente en esa terminal. No lo compartas por chat ni lo guardes en el repositorio. Para volver a comprobar la vinculación:

```powershell
npx supabase link --project-ref vxmjsgbpfmofbcpetgjd
```

Para revisar las claves sin revelar las claves secretas:

```powershell
npx supabase projects api-keys
```

No uses `--reveal` y nunca copies una clave `sb_secret_...` ni una clave `service_role` al cliente.

## Variables de entorno

Crea `.env.local` desde el ejemplo únicamente si necesitas reconstruir la configuración local:

```powershell
Copy-Item .env.example .env.local
```

Variables requeridas por el cliente central:

| Variable | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://vxmjsgbpfmofbcpetgjd.supabase.co` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave publishable `sb_publishable_...` del proyecto |

`.env.local` está creado localmente, conserva sus otras variables, no contiene nombres duplicados y está ignorado por `.gitignore`; `.env.example` permanece versionable. Las variables `VITE_*` se incorporan al bundle del navegador: solo debe usarse la clave publishable. No agregues claves secretas, `service_role` ni tokens de acceso de la CLI a variables del frontend.

## Sesiones anónimas

El carrito requiere un usuario anónimo de Supabase Auth; no pide correo ni contraseña. La configuración de Supabase local en `supabase/config.toml` permite inicios anónimos. Esta opción local no cambia la configuración de Cloud. En el Dashboard Cloud, habilítala en **Authentication → Sign In / Providers → Anonymous Sign-Ins**. Si está desactivada, la app muestra esa ruta junto al error de Auth.

La sesión anónima se conserva en el almacenamiento del navegador. Si se borran los datos del sitio, el usuario anónimo no puede recuperar su sesión ni su carrito.

## Catálogo, carrito y mensajes conectados

- `package.json` y `package-lock.json`: CLI local y SDK de Supabase.
- `supabase/config.toml` y `supabase/.gitignore`: scaffolding de `supabase init`.
- `.env.example`: URL Cloud verificada y marcador para la clave publishable.
- `.env.local`: URL y clave publishable del proyecto; archivo local ignorado por Git.
- `src/lib/supabase.js`: cliente centralizado con validación explícita de variables.
- `supabase/migrations/20261118193000_create_products_catalog.sql`: crea `public.products`, activa RLS, permite solo lectura a `anon` y `authenticated`, y carga los 39 productos con IDs 1–39.
- `supabase/migrations/20261118195500_create_user_carts.sql`: crea un carrito por usuario anónimo y líneas únicas por producto; cantidad de 1 a 99; RLS restringe cada operación al propietario.
- `supabase/migrations/20261118202000_create_contact_messages.sql`: crea `public.contact_messages` con validaciones de nombre, teléfono, correo, motivo, mensaje, consentimiento y resumen opcional del carrito. `anon` y `authenticated` solo pueden insertar los campos del formulario; `service_role` conserva el acceso administrativo. No hay lectura pública ni clave administrativa en el cliente.
- `supabase/migrations/20261122003600_add_order_metadata_to_contact_messages.sql`: añade el tipo de solicitud (`Consulta` o `Pedido`) y su estado administrativo (`Pendiente`, `En revisión`, `Respondido` o `Cerrado`).
- `supabase/migrations/20261122004000_grant_order_metadata_insert.sql`: permite que `anon` y `authenticated` escriban el tipo de solicitud, sin darles acceso de lectura o actualización.
- `supabase/migrations/20261122004400_reserve_order_status_for_admin.sql`: reserva el estado al valor por defecto `Pendiente`; clientes no pueden asignar un estado administrativo.
- `src/App.jsx` y `src/components/ProductCatalog.jsx`: Productos consulta precios remotos y el carrito autentica, importa una sola vez el carrito local legado, lee precios relacionados desde `products` y persiste sus cambios.
- `src/components/Dialogs.jsx`: el carrito permite cambiar cantidades, quitar líneas y vaciarlo; muestra el estado/error de sincronización.
- `src/App.jsx`, `src/components/ContentSections.jsx` y `src/components/Dialogs.jsx`: la solicitud solo muestra éxito tras insertarse en `contact_messages`; si falla, conserva los datos y permite reintentar.
- `src/lib/cart.js`: agrupa líneas repetidas antes de validar; `60 + 39` se normaliza a 99 y `60 + 40` se rechaza para ese producto sin descartar los demás.
- `.gitignore`: sus reglas existentes excluyen `.env.local`.

El catálogo y los precios de líneas del carrito se leen de Supabase. Si existe un carrito remoto, se conserva; el carrito legado de `localStorage` solo se importa cuando no hay uno remoto, y su marca local evita importarlo repetidamente tras una recarga. Las filas guardan solo `product_id` y `quantity`; el precio vigente viene de la relación con `public.products`.

Para comprobar la conexión, ejecuta `npm run dev`, abre `/#/productos` y confirma el estado del catálogo. Abre el carrito para ver su estado de sincronización. Si la consulta o una escritura fallan, se muestra el error y una opción de reintento.

Las solicitudes se insertan usando el cliente público de Supabase. Los visitantes sin sesión usan el rol `anon`; las sesiones anónimas del carrito usan `authenticated`. Ambos roles tienen permiso de inserción y política RLS, pero no de lectura, actualización ni eliminación. Esas operaciones quedan reservadas al Dashboard o a servicios administrativos que mantengan las claves fuera del navegador. Los pedidos se guardan como `request_type = 'Pedido'`, `status = 'Pendiente'` y admiten el texto escrito aunque el carrito esté vacío. Los artículos y el total del carrito dentro del mensaje son un resumen informativo enviado por el cliente, no una confirmación de precio, inventario, compra o pago.

El inicio de sesión GitHub del Dashboard solo da acceso administrativo al panel y no autentica clientes en PetCocha. La SPA no tiene cuentas de cliente con correo/contraseña: crea y persiste una sesión anónima de Supabase Auth para el carrito. Sin esa sesión, catálogo y formulario siguen siendo accesibles; el formulario inserta bajo `anon`.

El comparador y las respuestas de la guía siguen siendo estados transitorios de interfaz y no necesitan tablas salvo que la consigna exija historial. Las solicitudes de contacto sí quedan en Supabase, pero aún no hay panel administrativo en la SPA para consultarlas o gestionarlas.

## Comprobaciones y comandos útiles

```powershell
npx supabase --version
npx supabase projects list
npx supabase migration list --remote
npx supabase db query --remote=vxmjsgbpfmofbcpetgjd --read-only "select id, name from public.products order by id"
npx supabase db query --remote=vxmjsgbpfmofbcpetgjd --read-only "select c.id, count(i.id) from public.carts c left join public.cart_items i on i.cart_id = c.id group by c.id"
npx supabase db query --remote=vxmjsgbpfmofbcpetgjd --read-only "select id, sent_at, name, reason from public.contact_messages order by sent_at desc limit 10"
npm run lint
npm run build
```

La CLI, el ref del proyecto, el SDK, la clave publishable local, el cliente central, las migraciones, el catálogo y el carrito se validan con esos comandos. Para desarrollar localmente, ejecuta `npm run dev`.
