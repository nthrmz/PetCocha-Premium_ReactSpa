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

`supabase init` se completó y creó `supabase/config.toml`. La autenticación se verificó con `npx supabase projects list`: la CLI devuelve el proyecto `PetCocha` como `ACTIVE_HEALTHY` y `linked: true`. El ref de la lista coincide con `supabase/.temp/project-ref` y con el Dashboard. La vinculación se realizó con `npx supabase link --project-ref vxmjsgbpfmofbcpetgjd`. No se modificó la base de datos remota ni se crearon migraciones.

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

`.env.local` está creado localmente e ignorado por `.gitignore`; `.env.example` permanece versionable. Las variables `VITE_*` se incorporan al bundle del navegador: solo debe usarse la clave publishable. No agregues claves secretas, `service_role` ni tokens de acceso de la CLI a variables del frontend.

## Archivos preparados

- `package.json` y `package-lock.json`: CLI local y SDK de Supabase.
- `supabase/config.toml` y `supabase/.gitignore`: scaffolding de `supabase init`.
- `.env.example`: URL Cloud verificada y marcador para la clave publishable.
- `.env.local`: URL y clave publishable del proyecto; archivo local ignorado por Git.
- `src/lib/supabase.js`: cliente centralizado con validación explícita de variables.
- `.gitignore`: sin cambios; sus reglas existentes protegen `.env.local`.
- `SUPABASE_SETUP.md`: esta guía.

El módulo del cliente todavía no se importa en la aplicación: se inicializó y verificó por separado, así que las pantallas, el diseño y las funciones existentes siguen sin cambios. No se añadió lógica de negocio.

## Comprobaciones y comandos útiles

```powershell
npx supabase --version
npx supabase projects list
npx supabase link --project-ref vxmjsgbpfmofbcpetgjd
npm run lint
npm run build
```

La CLI, autenticación, proyecto vinculado, SDK, clave publishable local, cliente central, lint y compilación fueron comprobados. Para desarrollar localmente, ejecuta `npm run dev`. No se requiere configuración remota adicional para empezar a integrar funcionalidades; las tablas, políticas y cambios de base de datos quedan pendientes hasta que se soliciten expresamente.
