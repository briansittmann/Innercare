# Keystatic en Innercare: hoja de hechos verificados

Fecha: 2026-11-04. Proyecto: Next 16.4.3 (Turbopack), React 19.3.0, `cacheComponents` + `partialPrefetching`.

Etiquetas:
- **VERIFICADO (fuente)**: confirmado en la doc, en el código publicado en npm o en una prueba.
- **VERIFICADO EN PRUEBA**: reproducido en una app mínima del scratchpad (`scratchpad/ks-pkg/`, fuera del proyecto: Next 16.4.3, React 19.3.0, `@keystatic/core` 0.6.9, `@keystatic/next` 5.0.5, `cacheComponents` + `partialPrefetching`, build con Turbopack). El código fuente leído es el de esa instalación (`ks-pkg/node_modules/@keystatic/...`).
- **NO ENCONTRADO / SUPUESTO**: sin fuente; es un razonamiento explícito.

Abreviaturas de rutas:
- `KS` = `scratchpad/ks-pkg/node_modules/@keystatic/core/dist`
- `KN` = `scratchpad/ks-pkg/node_modules/@keystatic/next/dist`
- `ND` = `/Users/brianrebagliati/Documents/Work/Innercare/node_modules/next/dist/docs`
- `KD` = `https://raw.githubusercontent.com/Thinkmill/keystatic/main/docs/src/content/pages/` (fuente de keystatic.com/docs)

---

## 1. Versiones y compatibilidad

### Versiones publicadas — VERIFICADO (`npm view`, 2026-11-04)

| Paquete | Última | Publicada | `peerDependencies` |
|---|---|---|---|
| `@keystatic/core` | **0.6.9** | 2026-08-26 | `react ^18.2.0 \|\| ^19.0.0`, `react-dom` igual, `react-aria 3.50.0` (exacta), `react-stately 3.48.0` (exacta), `@keystar/ui ~0.10.0` |
| `@keystatic/next` | **5.0.5** | 2026-08-18 | `@keystatic/core *`, `next >=14`, `react ^18.2.0 \|\| ^19.0.0`, `react-dom` igual |
| `@keystar/ui` | 0.10.0 | (dep. de core) | `next >=14`, `react ^18.2.0 \|\| ^19.0.0`, `react-aria 3.50.0`, `react-stately 3.48.0` |

- `@keystatic/next` 5.0.3: "Allow React 19 in peerDependencies" (VERIFICADO, `packages/next/CHANGELOG.md` en GitHub).
- `@keystatic/core` 0.6.0: `react-aria`, `react-stately` y `@keystar/ui` pasan a versión **exacta**, como dependencia y como peer; "you should likely pin `@keystatic/core` to an exact version if you depend on these packages yourself" (VERIFICADO, `packages/keystatic/CHANGELOG.md`). El proyecto hoy no depende de ninguno de los tres (VERIFICADO, `package.json`).
- 0.6.6: "Support GitHub rulesets to automatically create a branch when pull requests are required" (VERIFICADO, mismo changelog).
- `@keystatic/core` declara `@types/react ^19.0.8` como **dependencia** (no dev). SUPUESTO: npm lo deduplica con el `@types/react ^19` del proyecto; si no, quedarían dos copias de tipos.

### ¿Declaran soporte para Next 16?

- **NO ENCONTRADO** como declaración explícita. El rango `next >=14` lo admite. La guía dice "This guide assumes you have an existing Next.js 14 project" (VERIFICADO, `KD/installation-next-js.mdoc`) y la plantilla oficial usa `next ~15.1.10` (VERIFICADO, `templates/nextjs/package.json` en GitHub).
- El repo de Keystatic ya despliega su sitio con Next 16 (PR #1576 "Use pnpm 11, next 16 and opennext…", cerrada 2026-08-05; VERIFICADO, búsqueda en GitHub).
- **VERIFICADO EN PRUEBA**: con Next 16.4.3 + Turbopack + `cacheComponents` + `partialPrefetching` + React 19.3.0, `next build` compila, `next start` sirve `/keystatic` y el panel monta en `next dev` (Turbopack) en modo local, con lectura y escritura de archivos.

### Issues relevantes en GitHub — VERIFICADO (API de búsqueda de GitHub)

| # | Estado | Resumen | Nos afecta |
|---|---|---|---|
| [#1549](https://github.com/Thinkmill/keystatic/issues/1549) | abierto (2026-06-18) | En modo `github` (y `cloud`) el panel queda **en blanco en `next dev` con Next 16**. Causa encontrada en un comentario: `RedirectToLoopback` pasa de `localhost` a `127.0.0.1` y la protección de orígenes de `next dev` bloquea los recursos de desarrollo. Arreglo: `allowedDevOrigins: ['127.0.0.1']`. En producción funciona. | Sí, al probar Cloud en local. Confirmé que el código sigue igual en 0.6.9: `KS/keystatic-core-ui.js:8380-8408` (para todo lo que no es `local`). |
| [#1501](https://github.com/Thinkmill/keystatic/issues/1501) | cerrado 2026-03-23 | `@keystar/ui` se importaba a sí mismo y rompía Turbopack (`useGridStyleProps is not a function`, panel en blanco). | No: en `@keystar/ui` 0.10.0 ya no está el autoimport (`grep` sin resultados en `keystar-ui-layout.js`) y la prueba con Turbopack funciona. |
| [#1393](https://github.com/Thinkmill/keystatic/issues/1393) | abierto (2025-01) | Turbopack + modo `github` en Next 14: `ReferenceError: e is not defined` en urql. | SUPUESTO: es viejo y no lo pude probar sin una cuenta Cloud. Hay que confirmarlo en `next dev` con `kind: 'cloud'`. |
| [#1627](https://github.com/Thinkmill/keystatic/issues/1627) | abierto (2026-09-24) | **Keystatic Cloud**: guardar una entrada con `fields.array` borró campos hermanos (dos `fields.image` y el cuerpo) sin avisar, o falló con un error de GraphQL. Pasó con `fields.array` junto a `fields.image` en el mismo documento. | Sí, si usamos arrays junto a imágenes o archivos en Cloud. |
| [#1594](https://github.com/Thinkmill/keystatic/issues/1594) | abierto (2026-08-12) | Un borrador local viejo (IndexedDB, sin vencimiento) tapa el archivo; si se aprieta "Save" en ese estado, se sobrescribe el contenido real. No hay opción para desactivar los borradores. | Sí: riesgo para editores no técnicos. |
| [#1578](https://github.com/Thinkmill/keystatic/issues/1578) | abierto (2026-08-05) | `locale` traduce solo 27 textos; el resto queda en inglés. | Sí (ver §2). |
| [#1617](https://github.com/Thinkmill/keystatic/issues/1617) | abierto | Con `entryLayout: 'content'` + `format: { data: 'json' }`, editar solo el cuerpo borra `index.json`. | Solo si usamos esa combinación. |

- Búsquedas sin resultados para "cacheComponents", "dynamicIO" y "use cache" relacionadas con Keystatic: **NO ENCONTRADO** ningún issue.

### Dependencias pesadas y bundle

- Dependencias de `@keystatic/core` 0.6.9 (VERIFICADO, `npm view`): `@keystar/ui`, `react-aria`, `react-stately`, `slate` + `slate-react`, prosemirror (7 paquetes), `yjs` + `y-prosemirror` + `y-protocols` + `@toeverything/y-indexeddb`, `urql` + `@urql/*` + `graphql`, `@markdoc/markdoc`, `mdast-*`/`micromark-*` (MDX y GFM), `js-yaml`, `superstruct`, `lru-cache`, `partysocket`… Tamaño en disco: `@keystar/ui` 19 MB, `react-aria` 35 MB, `react-stately` 9,4 MB, `@keystatic/core` 2,5 MB (VERIFICADO, `du`).
- **El lector no arrastra la interfaz**: `@keystatic/core` exporta variantes `react-server` (VERIFICADO, `exports` de `package.json`). `keystatic-core-reader.node.react-server.js` y lo que importa solo usan `js-yaml`, `@markdoc/markdoc`, `emery`, `@braintree/sanitize-url`, `node:fs/promises`, `node:path` y `react`. Los componentes de entrada de los campos son funciones vacías en ese entorno (VERIFICADO, `KS/index-10ea50e2.node.react-server.js`: "used in react-server environments to avoid bundling UI when the reader API is used").
- **VERIFICADO EN PRUEBA**: en el build, `/` (que lee con el lector) carga 8 chunks y **ninguno menciona keystatic**. `/keystatic` carga 3,36 MB de JS sin comprimir (8 chunks). El panel pesa, pero solo en su ruta.
- El panel pide la fuente Inter a `https://fonts.googleapis.com` y `@keystar/ui` le pone estilos globales a `<html>` y `<body>` (`ClientSideOnlyDocumentElement`) (VERIFICADO, `KS/keystatic-core-ui.js:1802-1815`). Sobre el sitio no tiene efecto si el panel tiene su propio layout raíz (ver §2).

---

## 2. Montaje en App Router

### Código oficial, tal cual lo da la doc — VERIFICADO (`KD/installation-next-js.mdoc`)

```typescript
// keystatic.config.ts
import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        content: fields.markdoc({ label: 'Content' }),
      },
    }),
  },
});
```

```ts
// src/app/keystatic/keystatic.ts
"use client";

import { makePage } from "@keystatic/next/ui/app";
import config from "../../../keystatic.config";

export default makePage(config);
```

```tsx
// src/app/keystatic/layout.tsx
import KeystaticApp from "./keystatic";

export default function Layout() {
  return (
    <KeystaticApp />
  );
}
```

```jsx
// src/app/keystatic/[[...params]]/page.tsx

export default function Page() {
  return null;
}
```

```tsx
// src/app/api/keystatic/[...params]/route.ts
import { makeRouteHandler } from '@keystatic/next/route-handler';
import config from '../../../../../keystatic.config';

export const { POST, GET } = makeRouteHandler({
  config,
});
```

- La plantilla oficial (`templates/nextjs/app/keystatic/`) es idéntica, con `keystatic.tsx` (VERIFICADO, GitHub).
- `makePage` no lleva `'use client'` propio: es un componente que renderiza `<Keystatic config appSlug />` de `@keystatic/core/ui`, que tampoco lo lleva. Por eso el archivo que lo llama tiene que tener `'use client'` (VERIFICADO, `KN/keystatic-next-ui-app.js` y la primera línea de `KS/keystatic-core-ui.js`).
- `makeRouteHandler` devuelve `{ GET, POST }`, cambia `localhost` por `127.0.0.1` en la URL y delega en el manejador genérico (VERIFICADO, `KN/keystatic-next-route-handler.js`).
- El panel usa **su propio router** (`history.pushState`/`replaceState` sobre `window.location`, y fuera de `/keystatic` usa `location.assign`). No usa `next/navigation` (VERIFICADO, `KS/index-5d64e651.js:65-79`; `grep` de `next/navigation` sin resultados en core). Se monta solo en el cliente (`ClientOnly`, `useEffect` → `mounted`; VERIFICADO, `KS/keystatic-core-ui.js:8460`). En el servidor no renderiza nada.

### `ui.brand`, `ui.navigation` y `locale` — VERIFICADO (`KD/user-interface.mdoc`, tipos en `KS/declarations/src/config.d.ts`)

```tsx
// keystatic.config.tsx
import { config } from '@keystatic/core'

export default config({
  ...
  ui: {
    brand: {
      name: 'Your brand',
      mark: ({ colorScheme }) => {
        let path = colorScheme === 'dark'
          ? '//your-brand.com/path/to/dark-logo.png'
          : '//your-brand.com/path/to/light-logo.png';
        
        return <img src={path} height={24} />
      },
    },
  },
})
```

```jsx
ui: {
  navigation: {
    'Content': ['pages', 'posts'],
    'Settings': ['site', 'seo'],
  },
},
// o una lista, con '---' como separador
ui: { navigation: ['pages', 'posts', '---', 'site', 'seo'] },
```

- Tipo: `brand?: { mark?: (props: { colorScheme: 'light' | 'dark' }) => ReactElement; name: string }`. La doc recomienda una altura de 24 px como máximo. Con `mark` en JSX, el archivo tiene que ser **`keystatic.config.tsx`** (la doc lo llama así).
- `locale?: Locale`. Valores admitidos (VERIFICADO, `KS/declarations/src/app/l10n/locales.d.ts`): `ar-AE, bg-BG, cs-CZ, da-DK, de-DE, el-GR, en-US, es-ES, et-EE, fi-FI, fr-FR, he-IL, hr-HR, hu-HU, it-IT, ja-JP, ko-KR, lt-LT, lv-LV, nb-NO, nl-NL, pl-PL, pt-BR, pt-PT, ro-RO, ru-RU, sk-SK, sl-SI, sr-SP, sv-SE, tr-TR, uk-UA, zh-CN, zh-TW`. **`es-ES` existe; `es-AR` no.** El valor por defecto es `'en-US'` (`KS/keystatic-core-ui.js:1808`).
- **Limitación**: `es-ES` traduce solo los 27 textos del "cromo" (Agregar, Guardar, Ramas, Panel, Crear Pull Request…; VERIFICADO, `KS/index-3c244051.js:349-377`; issue #1578). **VERIFICADO EN PRUEBA** con `locale: 'es-ES'`: "Dashboard" sale como "Panel", pero el botón del singleton dice **"Save"** (escrito a mano: `KS/keystatic-core-ui.js:6727`, `isCreating ? "Create" : "Save"`) y el campo de archivo dice "Choose file", "Remove" y "Download". Los mensajes de validación salen en inglés ("Titular must not be empty"). Las etiquetas y descripciones de los campos son nuestras y salen en castellano. Además, la traducción está en tuteo peninsular ("Elige", "necesitas"), no en voseo.

### Que el panel no herede `app/layout.tsx` del sitio

- **La doc de Keystatic no habla de route groups** (VERIFICADO, `KD/installation-next-js.mdoc`, y WebFetch de keystatic.com: "The page doesn't mention route groups"). La guía pone el panel debajo del layout raíz (`app/keystatic/layout.tsx` sin `<html>`), o sea que lo hereda.
- El sitio de Keystatic usa **un solo layout raíz mínimo** (`docs/src/app/layout.tsx`: `<html><body>{children}`) más un grupo `(public)/layout.tsx` que importa `global.css` y el header. El panel queda en `app/keystatic/page.tsx`, fuera del grupo (VERIFICADO, árbol del repo en GitHub).
- Doc de Next (VERIFICADO, `ND/01-app/03-api-reference/03-file-conventions/route-groups.md` y `layout.md`): se pueden tener **varios layouts raíz** con route groups. Cada uno tiene que definir `<html>` y `<body>`. Pasar de un layout raíz a otro provoca una carga completa de la página. Sin `app/layout.js` arriba, la home tiene que estar dentro de un grupo.
- **VERIFICADO EN PRUEBA**: compila y sirve con esta estructura:

```
app/(sitio)/layout.tsx          ← html/body, fuentes, globals.css, header, footer, {modal}
app/(sitio)/page.tsx, contacto/, productos/…
app/(sitio)/@modal/…            ← el slot va DENTRO del grupo, junto a su layout
app/(panel)/keystatic/layout.tsx       ← html/body propio + metadata robots + <KeystaticApp />
app/(panel)/keystatic/keystatic.tsx    ← 'use client' + makePage(config)
app/(panel)/keystatic/[[...params]]/page.tsx  ← null + `export const instant = false`
app/api/keystatic/[...params]/route.ts ← sin layout (es un route handler)
```

  `next build` → `/` ○, `/contacto` ○, `/keystatic/[[...params]]` ◐ (Partial Prerender), `/api/keystatic/[...params]` ƒ.

### Slots paralelos (`@modal`) al mover el layout a un grupo

- Doc de Next (VERIFICADO, `ND/…/parallel-routes.md`): "Slots are passed as props to the shared parent layout". El slot tiene que estar al mismo nivel que el layout que lo recibe, así que **`app/@modal` pasa a `app/(sitio)/@modal`**. Para slots con nombre, `default.js` es necesario en la carga completa: "If `default.js` doesn't exist, an error is returned for named slots" (`default.md`). El proyecto ya tiene `@modal/default.tsx`.
- Intercepción (VERIFICADO, `intercepting-routes.md`): "The `(..)` convention is based on _route segments_, not the file-system" y no cuenta los `@slot`. Los grupos tampoco son segmentos, así que `(sitio)/@modal/(.)contacto` sigue interceptando `/contacto`. **VERIFICADO EN PRUEBA**: compila y la carga directa de `/contacto` muestra la página, no el panel. La apertura como panel en navegación del cliente **no la probé en el navegador**.
- **Problema encontrado (VERIFICADO EN PRUEBA, reproducible)**: con `app/(sitio)/@modal/[...catchAll]/page.tsx` (como el `app/@modal/[...catchAll]` actual), **`next dev` responde 404 en `/keystatic` y `/keystatic/*`**, aunque `next build && next start` responde 200. Si se quita el catch-all, `next dev` responde 200. Arreglo probado (rutas en `dev`, sin probar el cierre del panel en navegador): reemplazar el catch-all por páginas explícitas del slot que devuelvan `null` (`@modal/page.tsx` para `/` y `@modal/productos/[...resto]/page.tsx`). La doc de Next ofrece las dos variantes para cerrar el modal (`parallel-routes.md`: "create a `@auth/page.tsx`…" y "Or… you can use a catch-all slot").
- **`instant`**: con el patrón oficial (el layout renderiza `<KeystaticApp />` e ignora `children`), `next dev` registra en cada carga `Error: Route "/keystatic/[[...params]]": Could not validate that a segment in your UI has instant navigation… Dropped segment: app/(panel)/keystatic/[[...params]]/page.jsx`. **VERIFICADO EN PRUEBA** que `export const instant = false` en ese `page.tsx` lo elimina. La doc lo admite: "`false`: Opts the segment out" (`ND/…/02-route-segment-config/instant.md`; solo con `cacheComponents` y no en componentes cliente).
- **404 global**: con varios layouts raíz y sin `global-not-found`, una URL inexistente muestra el 404 pelado de Next (VERIFICADO EN PRUEBA: "404: This page could not be found.", sin el header ni las fuentes). La doc indica `app/global-not-found.tsx` con `experimental: { globalNotFound: true }` justamente para el caso de varios layouts raíz (VERIFICADO, `ND/…/not-found.md:49-76`). El proyecto hoy no tiene `not-found.tsx`.
- `globals.css` tiene que importarse desde `app/(sitio)/layout.tsx`, no desde el panel; así Tailwind no le aplica su preflight a la interfaz de Keystatic (como hace el sitio de Keystatic con `(public)/layout.tsx`; VERIFICADO en su repo). `app/opengraph-image.tsx`: SUPUESTO que conviene moverlo a `app/(sitio)/` para que siga aplicando a `/` (no lo probé). `LayoutProps<'/'>` en el layout del grupo: SUPUESTO, verificar con `tsc` (la prueba fue en JS).
- **Por qué no dejar el panel bajo el layout del sitio**: el header usa `usePathname` (`components/desktop-nav.tsx`, `header-fondo.tsx`, `nav-intro.tsx`, `mobile-nav.tsx`). Según la doc, "A nav or breadcrumb in a shared layout… suspends while Next.js generates the static shell for any route below it that has dynamic params. Wrap the component that reads the hook in `<Suspense>`… or the build fails" (VERIFICADO, `ND/01-app/02-guides/migrating-to-cache-components.md:716`). `/keystatic/[[...params]]` tiene params dinámicos sin `generateStaticParams`. Con un layout raíz propio, el problema no existe (SUPUESTO en cuanto a la falla concreta: no lo probé con el header bajo el panel).

---

## 3. Lector (`createReader`)

### API — VERIFICADO (`KD/reader-api.mdoc` y `KS/declarations/src/reader/*.d.ts`)

```javascript
import { createReader } from '@keystatic/core/reader';
import keystaticConfig from 'relative/path/to/your/keystatic.config';
const reader = createReader(process.cwd(), keystaticConfig);

const slugs = await reader.collections.posts.list();
const post = await reader.collections.post.read(slug);
const posts = await reader.collections.blog.all();
const navigation = await reader.singletons.navigation.read();
await reader.collections.posts.read(slug, { resolveLinkedFiles: true });
```

- Métodos: colecciones `read(slug, opts?)` → `entry | null`, `readOrThrow`, `all(opts?)` → `{ slug, entry }[]` (omite las que faltan), `list()`; singletons `read(opts?)` → `entry | null`, `readOrThrow`.
- Tipos: **`Entry<typeof config['collections']['x']>`** y **`EntryWithResolvedLinkedFiles<…>`**, exportados desde `@keystatic/core/reader`. La doc usa `Entry<typeof keystaticConfig['collections']['movies']>` y funciona igual con `['singletons']['x']`: `Entry<C | S>` admite colección o singleton (`generic.d.ts`).
- **Lee con `fs` en tiempo de ejecución**, asíncrono: `node:fs/promises` (`stat`, `readdir`, `readFile`) sobre `path.join(repoPath, ruta)`; ENOENT → `null` o `[]` (VERIFICADO, `KS/keystatic-core-reader.node.react-server.js:15-60`). Usa `React.cache` para memoizar por petición (`KS/generic-21f5a134.node.react-server.js`).
- Los campos de contenido enlazado (`markdoc`, `mdx`, `document`) se devuelven como `() => Promise<…>` salvo con `resolveLinkedFiles: true`.

### `cacheComponents`: ¿`'use cache'` o basta con leer?

- Doc de Next (VERIFICADO, `ND/01-app/01-getting-started/08-caching.md`, sección "Predictable values"): `fs.readFileSync` y los imports de módulo se prerenderizan solos. En cambio: "**Calling `await readFile()` inside the component would be treated as uncached data that must be either accessed within `use cache` or behind a `<Suspense>` boundary.** Since this file does not depend on the request and is not expected to change, module scope is the simplest option." El lector usa `fs/promises`, o sea que es "uncached data".
- **VERIFICADO EN PRUEBA**: una página que hace `await reader.singletons.inicio.read()` sin `'use cache'` **rompe el build**: `Error: Route "/sin-cache": Next.js encountered uncached or runtime data during prerendering… Export encountered an error… exiting the build.`
- **VERIFICADO EN PRUEBA**: con la lectura dentro de una función `'use cache'` + `cacheLife('max')`, `/` sale ○ (estático), con Revalidate 30d y Expire 1y.

```ts
// patrón probado
import { createReader } from '@keystatic/core/reader'
import { cacheLife } from 'next/cache'
import config from '@/keystatic.config'
const reader = createReader(process.cwd(), config)
export async function leerInicio() {
  'use cache'
  cacheLife('max')
  const d = await reader.singletons.inicio.read()
  // devolver datos planos: ver "Serialización"
  return d && { titular: d.titular, bajada: d.bajada }
}
```

- La otra opción documentada es el **ámbito de módulo** (`const x = await readFile(...)` fuera del componente), "read them once at module scope" (misma sección). No la probé con el lector.
- **Serialización** (VERIFICADO, `ND/…/01-directives/use-cache.md`, "Unsupported types: Class instances, Functions"): lo que devuelve una función `'use cache'` tiene que ser serializable. Los campos `markdoc`/`mdx`/`document` del lector devuelven funciones; con `resolveLinkedFiles`, `markdoc` y `markdoc.inline` devuelven `{ node: MarkdocNode }`, que es una instancia de clase. Para esos campos conviene cachear el **componente** (devuelve JSX, que sí se admite) o convertir a datos planos dentro del ámbito cacheado (SUPUESTO sobre el error exacto: no probé devolver un `Node`).
- `React.cache` dentro de `'use cache'` queda aislado (VERIFICADO, `use-cache.md`, "React.cache isolation"). No afecta: el lector lo usa solo dentro de su propia llamada.
- **Las ediciones en producción llegan con el redeploy; `revalidateTag` no hace falta**: "All of these stores are scoped to a single deployment. A new deploy starts fresh, new prerenders are built, and `use cache` entries don't carry over… because the cache key includes the build id" (VERIFICADO, `08-caching.md`, "Where cached content is stored"; también `use-cache.md`, "Cache keys": "Build ID… changing this invalidates all cache entries"). Cada commit de Cloud a `main` dispara un build nuevo en Vercel, que vuelve a leer los YAML.
- **Riesgo encontrado: los YAML no entran en la traza del servidor.** VERIFICADO EN PRUEBA: `.next/server/app/(sitio)/page.js.nft.json` no incluye `content/inicio.yaml`, porque el lector arma la ruta con `path.join` en ejecución y `@vercel/nft` no la sigue. Con `cacheLife('max')`, a los 30 días la próxima petición regenera en segundo plano (`cacheLife.md`: "After this time, the next request will trigger a background refresh"). Si esa regeneración corre en una función de Vercel sin los YAML, el lector devuelve `null` (ENOENT → `null`) y la página se rearma vacía. SUPUESTO en cuanto a Vercel (no lo desplegué). **Arreglo VERIFICADO EN PRUEBA**: `outputFileTracingIncludes: { '/*': ['./content/**/*'] }` mete `content/inicio.yaml` en el `.nft.json`. La doc avisa que las inclusiones no aplican a "Fully static pages" (`ND/…/output.md`); `/` igual tiene `.nft.json` y quedó incluido.
- **Desarrollo**: VERIFICADO EN PRUEBA. Con `'use cache'`, en `next dev`, si se cambia el YAML en disco (lo que hace el panel local al guardar), una recarga normal **sigue mostrando el valor viejo**. Una petición con `Cache-Control: no-cache` (la recarga forzada del navegador) muestra el nuevo. No encontré esto en la doc de Next. `ReaderRefresh` de `@keystatic/next/reader-refresh` no sirve en App Router: su endpoint `/api/keystatic/reader-refresh/` solo lo atiende `makeAPIRouteHandler` (Pages), no `makeRouteHandler` (VERIFICADO, `KN/keystatic-next-api.js` vs `keystatic-next-route-handler.js`).
- **`serverExternalPackages`**: no hace falta. Keystatic no está en la lista automática de Next (VERIFICADO, `next/dist/lib/server-external-packages.jsonc`), ninguna doc de Keystatic lo pide (NO ENCONTRADO) y el build con Turbopack funcionó sin él (VERIFICADO EN PRUEBA).

---

## 4. Campos y validación

Firmas (VERIFICADO, `KS/declarations/src/form/fields/*/index.d.ts`) y comportamiento (VERIFICADO, código en `KS/keystatic-core.node.react-server.js`, `index-10ea50e2…`, `index-9722793d…`, `generic-21f5a134…`).

| Campo | Opciones | Si falta la clave en el YAML, el lector devuelve | Validación al leer |
|---|---|---|---|
| `fields.text` | `label`, `defaultValue`, `description`, `multiline`, `validation: { isRequired, length: { min, max }, pattern: { regex, message } }` | **`''`** (no usa `defaultValue`) | sí: longitud, patrón y obligatorio |
| `fields.integer` | `label`, `defaultValue`, `description`, `validation: { isRequired, min, max }` | **`null`** (no usa `defaultValue`; VERIFICADO EN PRUEBA: con `defaultValue: 5` devolvió `null`) | sí |
| `fields.number` | + `step`, `validation.validateStep` | `null` | sí |
| `fields.url` | `label`, `defaultValue`, `description`, `validation.isRequired` | `null` (`''` también da `null`) | sí (`@braintree/sanitize-url`) |
| `fields.select` | `label`, `options`, `defaultValue` (obligatorio y tiene que estar entre las opciones: si no, lanza al definir) | **`defaultValue`** (VERIFICADO EN PRUEBA) | sí (valor fuera de las opciones → error) |
| `fields.checkbox` | `label`, `defaultValue`, `description` | `defaultValue` | tipo booleano |
| `fields.array(el, { label, description, itemLabel, slugField, validation: { length: { min, max } } })` | | `[]` | **sí, también la longitud** ("This should be true for the reader") |
| `fields.object({...}, { label, description, layout })` | | `{}` con cada campo resuelto | **claves desconocidas → error** |
| `fields.conditional(select\|checkbox, { valor: campo })` | | valor inicial (el discriminante por defecto) | sí |
| `fields.image` / `fields.file` | `label`, `directory`, `publicPath`, `description`, `validation.isRequired`, `transformFilename` | `null` | obligatorio sí; **no comprueba que el archivo exista** |
| `fields.markdoc` / `markdoc.inline` | `label`, `description`, `options`, `components`, `extension` | | |

- `null` en el YAML cuenta como ausente (`toFormFieldStoredValue`).
- Un `text` vacío no se escribe en el YAML (`serialize`: `value === '' ? undefined`). Un `integer` en `null` tampoco. Un `select` siempre se escribe (VERIFICADO EN PRUEBA: `tipo: b`).
- **Obligatorio vacío en la UI**: VERIFICADO EN PRUEBA. Con el titular vacío, "Save" no guarda y muestra "Titular must not be empty"; el archivo queda igual. El código: `clientSideValidateProp` → `setForceValidation(true); return` (`KS/keystatic-core-ui.js:2944, 5148, 6543`).
- **¿Se valida en el servidor al guardar?** No. En modo local, `POST /api/keystatic/update` solo valida que las rutas estén dentro de los directorios permitidos, no el esquema (VERIFICADO, `KS/keystatic-core-api-generic.node.js:173-203`). En Cloud, el guardado va del navegador a `api.keystatic.cloud`; NO ENCONTRADO que valide el esquema. **La validación real es la del navegador más la del lector en el build.**
- **El lector valida al leer**: `readItem` → `parseProps(…, true)` y, si falla, `throw new Error('Invalid data for singleton "x":\n…')` (VERIFICADO, `KS/generic-21f5a134.node.react-server.js:339-401`; Context7 `_autodocs/errors.md`).

### `fields.file`: ¿solo PDF? ¿Qué nombre guarda?

- **No se puede limitar a PDF.** El tipo admite solo `label`, `directory`, `validation.isRequired`, `description`, `publicPath` y `transformFilename`; no hay `accept` ni extensiones. El selector usa `getUploadedFile("")`, es decir `<input type="file" accept="">` (VERIFICADO, `KS/keystatic-core.js:1786` y `index-3c244051.js:13369-13393`). **VERIFICADO EN PRUEBA**: el `accept` del input es `""` y aceptó un `.gif` en el campo "Ficha PDF".
- **Nombre guardado: la clave del campo + la extensión original**, no el nombre original ni el slug. La doc del tipo: "When used outside of editor fields, this function [`transformFilename`] will **not** be used. Instead only the extension of the uploaded file is used and the start of the filename is based on the field key." (VERIFICADO, `file/index.d.ts`). En el código: `suggestedFilenamePrefix = pathWithArrayFieldSlugs.join('/')` y `filename = prefix + '.' + extension` (`KS/keystatic-core-ui.js:418`, `keystatic-core-node…:serialize`). **VERIFICADO EN PRUEBA**: "Mi Ficha Técnica.pdf" en el campo `ficha` (`directory: 'public/fichas'`, `publicPath: '/fichas/'`) quedó como `public/fichas/ficha.pdf` y en el YAML `ficha: /fichas/ficha.pdf`. Al reemplazar el GIF por el PDF, `ficha.gif` se borró.
- Ruta: en una colección, `{directory}/{slug}/{campo}.{ext}`; en un singleton, `{directory}/{campo}.{ext}` (sin slug, `getSrcPrefix(publicPath, slug)`; VERIFICADO, `KS/index-ca270311.node.react-server.js:734`). Dentro de un array: `campoArray/0/campo.ext`, o el `slugField` del array en vez del índice. **Riesgo (SUPUESTO por lectura de código)**: dos singletons con un campo de la misma clave y el mismo `directory` se pisan el archivo.
- Sin `directory`, el archivo va junto a los datos de la entrada (`args.dirpath`). En la doc de `image`: "the `coverImage` image will be generated in `public/images/posts/{post-slug}`" (VERIFICADO, `KD/content-organisation.mdoc`, `KD/fields/image.mdoc`).
- Para exigir PDF: SUPUESTO. Validarlo en nuestro código al leer (`ficha?.endsWith('.pdf')`) y fallar o caer a un valor por defecto; con `fields.text` + `pattern` no sirve porque el campo es un archivo.

### Texto con negritas

- `fields.document` está reemplazado: "`fields.markdoc` has superseded this field" (VERIFICADO, `KD/fields/document.mdoc`).
- `fields.markdoc.inline({ label, options })` guarda el contenido **dentro del mismo YAML** (`someContent: |`) en vez de un archivo `.mdoc` aparte (VERIFICADO, `KD/fields/markdoc.mdoc`). El lector devuelve `{ node: MarkdocNode }` (`markdoc/index.d.ts`) y para renderizarlo hace falta `@markdoc/markdoc` (`Markdoc.transform` + `renderers.react`, como en la guía).
- `options` (`MarkdocEditorOptions`): `bold, italic, strikethrough, code, heading, blockquote, orderedList, unorderedList, table, link, image, divider, codeBlock`. **VERIFICADO EN PRUEBA: lo que no se pone en `false` queda activo.** Con `{ bold: true, italic: false, heading: false }`, la barra igual mostró tachado, código, listas, divisor, enlace, cita, bloque de código, tabla e imagen. Para "solo negrita" hay que poner cada opción en `false`.
- La barra del editor también está en inglés (#1578: "Bold", "Italic", "Paragraph"…).

### Formato y ubicación — VERIFICADO (`KD/format-options.mdoc`, `KD/content-organisation.mdoc`, tipos)

- `format?: 'yaml' | 'json' | { data?: 'yaml' | 'json'; contentField? }`. Por defecto, YAML.
- Singleton: `path` por defecto `{nombre}/`. Con barra final → `{path}/index.yaml`; sin barra → `{path}.yaml` (VERIFICADO EN PRUEBA: `path: 'content/inicio'` → `content/inicio.yaml`).
- Colección: `path` con `*` obligatorio (`'content/x/*'` o `'content/x/*/'`).
- `storage.pathPrefix` (github/cloud) para prefijar todas las rutas.

---

## 5. Keystatic Cloud y GitHub

### Configuración — VERIFICADO (`KD/cloud.mdoc`)

```ts
import { config } from '@keystatic/core'

export default config({
  storage: {
    kind: 'cloud',
  },
  cloud: {
    project: '[TEAM_NAME]/[PROJECT_NAME]',
  },
  ...
})
```

"Each project in Keystatic Cloud has a settings page where you'll find a ready-to-paste code snippet in your config file."

### Plan gratis — VERIFICADO (`KD/cloud.mdoc`)

- "Creating a Keystatic Cloud account is free. You can create as many teams and projects as needed."
- "**The free plan allows for up to 3 users per team.**" Pro: "starts at $10/month. Adding beyond 3 users to a team costs $5/month per user." Las funciones Pro son la edición multijugador (experimental) y Cloud Images.
- "User access is set at the team level, so every user in team will have access to all projects within that team."
- "allowing team members to edit content without needing a GitHub account."
- **Para Innercare**: dos editores más el desarrollador son 3 usuarios, justo el tope del plan gratis (SUPUESTO: depende de si el desarrollador cuenta como usuario del equipo; la doc dice "users per team").
- keystatic.cloud respondió HTTP 500 al consultarlo; no pude leer la página de precios actual.

### Conexión del repo

- "each project is be connected to a specific GitHub repository" (VERIFICADO, `KD/cloud.mdoc`). El panel en Cloud habla con `https://api.keystatic.cloud` (VERIFICADO, `KS/index-5d64e651.js:1287`) y se autentica por OAuth con PKCE contra `api.keystatic.cloud/oauth/authorize`, con `redirect_uri = {origin}/keystatic/cloud/oauth/callback` (VERIFICADO, `KS/index-5d64e651.js:1293-1315`). La página `/keystatic/[[...params]]` tiene que existir para esa ruta (VERIFICADO EN PRUEBA: 200 en `next start`).
- **NO ENCONTRADO**: los pasos de instalación de la app de GitHub de Keystatic Cloud (la doc no los detalla y keystatic.cloud dio 500). En el issue #1627 se ve que los commits salen como **`keystatic-cloud[bot]`**, "co-authored by the connected GitHub account". SUPUESTO: el repo (`briansittmann/Innercare`, en una cuenta personal) necesita que el dueño instale esa app.
- **NO ENCONTRADO**: si Keystatic Cloud restringe qué orígenes (dominio de Vercel, previews) pueden usar el `redirect_uri`. Hay que revisar los ajustes del proyecto en Cloud.

### ¿A qué rama van los commits?

- **A la rama por defecto del repo en GitHub, salvo que el editor elija otra.** Al abrir `/keystatic`, `RedirectToBranch` lleva a `/keystatic/branch/{data.repository.defaultBranchRef.name}` (VERIFICADO, `KS/keystatic-core-ui.js:7980-8003`). En el mismo panel, el editor puede cambiar de rama o crear una (cadenas "Ramas", "Nueva rama", "Basado en", "Rama predeterminada" en `es-ES`; `CreateBranchDialog`).
- **La rama por defecto del repo hoy es `main`** (VERIFICADO, `git ls-remote --symref origin HEAD` → `ref: refs/heads/main`). Si el editor no toca nada, los commits van a `main`, Vercel despliega producción y el cambio queda publicado.
- **No hay opción en la config para fijar otra rama.** El tipo `CommonRemoteStorageConfig` solo tiene `pathPrefix` y `branchPrefix` (VERIFICADO, `KS/declarations/src/config.d.ts`).
- **`storage.branchPrefix` existe y funciona también con `cloud`** (VERIFICADO, tipo `CloudStorageConfig = { kind: 'cloud' } & CommonRemoteStorageConfig` y `getBranchPrefix`: `config.storage.kind !== 'local' ? config.storage.branchPrefix : undefined`, `KS/index-5d64e651.js:1186`). Doc: "Keystatic will only list branches starting with my-prefix/ in the Admin UI, and will only let you create new branches with that prefix" (VERIFICADO, `KD/configuration.mdoc`). La rama por defecto se lista igual (`item.name === repoInfo.defaultBranch || …`, `KS/index-3c244051.js:1459`). O sea que no impide escribir en `main`.
- **"Crear Pull Request"** abre GitHub en `${repoURL}/pull/new/${currentBranch}` (VERIFICADO, `KS/keystatic-core-ui.js:5840`). El PR se arma en GitHub, así que hace falta una cuenta con acceso al repo (SUPUESTO para editores sin cuenta de GitHub).
- Si `main` tiene reglas que exigen PR, desde la 0.6.6 Keystatic crea una rama automáticamente (VERIFICADO, changelog: "Support GitHub rulesets to automatically create a branch when pull requests are required"). Es una forma de evitar que se publique directo: protección de rama en GitHub, no una opción de Keystatic.

### Variables de entorno, salida estática y modo local en producción

- **Cloud no necesita variables de entorno.** `makeGenericAPIRouteHandler` con `storage.kind === 'cloud'` devuelve un manejador que siempre responde `404 Not Found` (VERIFICADO, `KS/keystatic-core-api-generic.node.js:312-319`; **VERIFICADO EN PRUEBA**: `GET /api/keystatic/tree` → 404 en Cloud). `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` y `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` son solo para `kind: 'github'` (mismo archivo, líneas 288-339). La doc de Cloud: "No need to deal with environment variables and a custom GitHub app" (`KD/cloud.mdoc`).
- **Salida estática (`output: 'export'`)**: NO ENCONTRADO en la doc. La guía dice "Because Keystatic needs to run serverside code and Next.js API routes, you will need to ensure that your hosting provider supports Node.js" (`KD/installation-next-js.mdoc`). En Cloud la API no se usa (responde 404), pero `/keystatic/[[...params]]` necesita servir cualquier subruta. SUPUESTO: con `export` haría falta otro manejo de esas subrutas. No aplica en Vercel.
- **`kind: 'local'` en producción es inseguro**: la API local **no tiene autenticación ni protección por `NODE_ENV`**. Solo pide la cabecera `no-cors: 1`. VERIFICADO EN PRUEBA con `next start`: `GET /api/keystatic/tree` devolvió el árbol de archivos del proyecto y `POST /api/keystatic/update` respondió **200**. En Vercel el sistema de archivos de las funciones es de solo lectura (SUPUESTO, no probado), así que la escritura fallaría, pero el árbol queda expuesto. La doc tiene una receta para cortar el panel y la API fuera de desarrollo (VERIFICADO, `KD/recipes/nextjs-disable-admin-ui-in-production.mdoc`: `showAdminUI = process.env.NODE_ENV === "development"` + `notFound()` en el layout + manejadores 404).
- **Condicionar `storage` por `NODE_ENV`: sí, es el patrón del sitio oficial** (VERIFICADO, `docs/keystatic.config.tsx` en GitHub, líneas 231-245):

```tsx
const shouldUseCloudStorage = process.env.NODE_ENV === 'production';

export default config({
  storage: shouldUseCloudStorage
    ? { kind: 'cloud', pathPrefix: 'docs' }
    : { kind: 'local' },
  cloud: {
    project: 'thinkmill-labs/keystatic-site',
  },
```

  VERIFICADO EN PRUEBA: compila. En producción, la API responde 404 y el panel 200. En `local` con `cloud` configurado, el panel muestra un botón "Sign into Cloud" (modo híbrido; Context7, `_autodocs/types.md`: "optional `cloud?: { project }` for local + cloud hybrid").
  Cuidado (SUPUESTO, razonamiento): la config se evalúa en el servidor y en el cliente (`makePage` está en un archivo `'use client'`). `NODE_ENV` se reemplaza igual en los dos lados. Una variable sin `NEXT_PUBLIC_` quedaría `undefined` en el cliente, y el panel y la API usarían modos distintos.
- **Probar Cloud con `next dev`**: hay que sumar `'127.0.0.1'` a `allowedDevOrigins` (#1549). La doc de Next: "The dev server already allows `localhost`, its subdomains, and the hostname it was started with. Any other hostname needs an entry" (VERIFICADO, `ND/…/allowedDevOrigins.md`). El proyecto ya tiene `allowedDevOrigins: ['192.168.*.*', '10.*.*.*']` en `next.config.ts`.

---

## 6. Robustez

Lo que dice la doc: el lector devuelve `null` si falta la entrada y lanza `Invalid data for …` si el archivo no pasa el esquema (VERIFICADO, Context7 `_autodocs/errors.md` y `09-reader.md`). **NO ENCONTRADO**: ningún mecanismo de respaldo para contenido inválido.

Pruebas con `next build` (VERIFICADO EN PRUEBA, lectura dentro de `'use cache'`):

| Caso | Resultado del build |
|---|---|
| Falta un campo obligatorio (`titular`) | **falla**: `Error: Invalid data for singleton "inicio": titular: Titular must not be empty … exiting the build` |
| YAML mal formado (`titular: [roto`) | **falla**: `YAMLException: unexpected end of the stream within a flow collection (2:1)` (el parseo está fuera del `try` del lector, así que el error llega crudo) |
| Clave que el esquema no conoce (`claveVieja: x`) | **falla**: `Key on object value "claveVieja" is not allowed` |
| Archivo del singleton borrado | **compila**, y `read()` devuelve `null` en silencio (la página salió con `null`) |

Razonamiento (SUPUESTO):
- Con un YAML a mano o un esquema cambiado sin migrar los datos, el build se cae y Vercel mantiene el despliegue anterior (comportamiento habitual de Vercel, no verificado acá). El sitio no se rompe, pero la edición no se publica y el editor no ve el error en el panel.
- Renombrar o quitar un campo del esquema sin limpiar los YAML rompe el build (por la clave desconocida). Cambiar un campo a obligatorio sin completar los datos también.
- Un archivo borrado no rompe nada y deja la sección vacía: conviene tratar `null` en el código, con `readOrThrow` o con valores por defecto propios.
- Los textos con `length.max` o `pattern` se validan también al leer: un YAML que los viole rompe el build.
- Riesgos que sí documentan los issues: el borrador local que pisa el contenido (#1594) y el guardado de arrays en Cloud que borra campos (#1627).

---

## 7. Específicos de Next 16.4

- **`robots: noindex` en metadata** (VERIFICADO, `ND/…/04-functions/generate-metadata.md:551-579`):

```tsx
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}
```

  Solo se admite en Server Components ("The `metadata` object and `generateMetadata` function exports are **only supported in Server Components**", línea 110). Va en `app/(panel)/keystatic/layout.tsx`, no en `keystatic.tsx`. **VERIFICADO EN PRUEBA**: `/keystatic/singleton/inicio` sale con `<meta name="robots" content="noindex, nofollow"/>`.
  Si algún `generateMetadata` del sitio lee Keystatic: "If metadata depends on external data but not runtime data, use `use cache`" (VERIFICADO, `generate-metadata.md:1272-1291`).
- **Sitemap**: `app/sitemap.ts` devuelve `MetadataRoute.Sitemap` con las URL que uno lista; para excluir `/keystatic`, alcanza con no listarlo (VERIFICADO, `ND/…/01-metadata/sitemap.md`). `robots.ts` admite `disallow` (ejemplo con `disallow: '/private/'`, `robots.md`). Los dos son "special Route Handler… cached by default unless it uses a Request-time API". El ejemplo de la doc usa `lastModified: new Date()`. SUPUESTO: con `cacheComponents` eso puede caer en el error de valores no deterministas ("Random values and timestamps", `08-caching.md`); conviene una fecha fija.
- **`partialPrefetching`**: prefetchea un App Shell por ruta para los `<Link>` (VERIFICADO, `ND/…/partialPrefetching.md`). El panel está en otro layout raíz y pasar a él es una carga completa (`route-groups.md`). No hay ni habrá `<Link>` del sitio a `/keystatic`, así que no cambia nada (SUPUESTO por razonamiento). `/keystatic/[[...params]]` sale ◐ en el build (VERIFICADO EN PRUEBA).
- **Página cliente con `cacheComponents`**: no hace falta `Suspense` ni `dynamic`. El panel no lee `params`, `searchParams`, `cookies` ni hooks de Next; usa su router y `ClientOnly`. VERIFICADO EN PRUEBA: compila sin errores y se prerenderiza un shell vacío. Lo único que hace falta es `export const instant = false` en `page.tsx` para el error de validación de `next dev` (ver §2).
- **`params` y `useSearchParams` con `cacheComponents`** (VERIFICADO): "Without `generateStaticParams`, param values are unknown during prerendering, making params runtime data. You must wrap param access in `<Suspense>`" (`dynamic-routes.md:151-160`). "The `useSearchParams` hook always needs a `<Suspense>` boundary" (`migrating-to-cache-components.md:722`). "When using Cache Components with dynamic routes, `generateStaticParams` must return **at least one param**. Empty arrays cause a build error" (`generate-static-params.md:311`). Nada de esto toca al panel, que no lee `params`; sí al header del sitio si quedara arriba de `[[...params]]` (ver §2).
- **Route handler de Keystatic**: lee `request.url` y `request.headers`, así que se ejecuta en cada petición. "Prerendering stops if the `GET` handler accesses… request object properties (like `req.url`, `request.headers`…)" (VERIFICADO, `ND/01-app/01-getting-started/15-route-handlers.md:124`). Sale ƒ en el build (VERIFICADO EN PRUEBA).
- **`preserving-ui-state.md`**: Next conserva hasta 3 rutas ocultas con `<Activity>` (VERIFICADO, línea 19). Los estilos de página pueden filtrarse a la página visible (línea 285). Con el panel en otro layout raíz y carga completa, sus estilos globales (emotion, `injectGlobal`, estilos en `<html>`) no conviven con el sitio (SUPUESTO por razonamiento, apoyado en "Navigating across multiple root layouts will cause a full page load").

---

## Archivos de la prueba (scratchpad, fuera del proyecto)

- App: `scratchpad/ks-pkg/` (`keystatic.config.jsx`, `app/(sitio)/…`, `app/(panel)/keystatic/…`, `app/api/keystatic/[...params]/route.js`, `content/inicio.yaml`, `next.config.mjs` con `outputFileTracingIncludes`).
- Scripts de navegador: `scratchpad/qa/panel.mjs` y `scratchpad/qa/guardar.mjs` (patchright con Chrome). Captura del panel: `scratchpad/qa/panel-dev.png`.
- Fuentes de la doc descargadas: `scratchpad/web/*.mdoc` y los changelogs.
