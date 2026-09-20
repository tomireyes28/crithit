# 🚀 CritHit — Guía Definitiva de Despliegue en Producción
## Vercel (Frontend Next.js) + Railway (Backend NestJS) + Supabase (PostgreSQL)

Esta guía detalla el procedimiento paso a paso para desplegar la plataforma **CritHit** en un entorno de producción de alta disponibilidad, seguridad y escalabilidad global con coste cero en niveles gratuitos/hobby.

---

## 📐 1. Arquitectura de Producción

```
                      ┌─────────────────────────────────────────┐
                      │             USUARIO FINAL               │
                      └────────────────────┬────────────────────┘
                                           │ HTTPS
                                           ▼
             ┌───────────────────────────────────────────────────────────┐
             │                     VERCEL EDGE NETWORK                   │
             │           Frontend Next.js 14 App Router (PWA)            │
             │           Dominio: https://crithit.gg                     │
             └─────────────────────────────┬─────────────────────────────┘
                                           │ REST API (Bearer JWT / CORS)
                                           ▼
             ┌───────────────────────────────────────────────────────────┐
             │                      RAILWAY CONTAINER                    │
             │           Backend NestJS 10 (Docker / Alpine Linux)       │
             │           Dominio: https://api.crithit.gg                 │
             │           Healthcheck: /api/health                        │
             └──────────────┬─────────────────────────────┬──────────────┘
                            │                             │
                            │ PgBouncer (6543) / SSL      │ HTTPS
                            ▼                             ▼
   ┌──────────────────────────────────┐      ┌───────────────────────────┐
   │         SUPABASE CLOUD           │      │         RAWG API          │
   │ PostgreSQL 16 (AWS us-east-2)    │      │ Catálogo de Videojuegos   │
   │ 3.016 Juegos + Banco de Críticos │      │ Metadatos & Carátulas     │
   └──────────────────────────────────┘      └───────────────────────────┘
```

---

## 🗄️ 2. Base de Datos en Supabase

La base de datos PostgreSQL ya se encuentra aprovisionada y operativa en **Supabase** (AWS región `us-east-2`).

### 2.1. Credenciales de Conexión
En el panel de Supabase (**Project Settings > Database**):
1. **Connection String (Transaction Pooler - Recomendado para Railway)**:
   ```text
   postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-us-east-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
   ```
2. **Direct Connection String (Puerto 5432 - Para migraciones y CLI)**:
   ```text
   postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres?sslmode=require
   ```

### 2.2. Sincronización del Esquema Prisma
Para desplegar el esquema más reciente en la base de datos de producción:
```bash
# Sincronizar modelos relacionales (User, Game, Review, Critic, etc.)
npx prisma db push --schema=apps/api/prisma/schema.prisma

# O mediante migraciones formales
npx prisma migrate deploy --schema=apps/api/prisma/schema.prisma
```

### 2.3. Carga de Datos Esenciales (Seeds)
Ejecutar los scripts de población de datos iniciales:
```bash
# 1. Poblar el banco de 44 preguntas de cultura de videojuegos para el Examen de Críticos
npm run db:seed --workspace=@crithit/api

# 2. Poblar el catálogo de 3.016 videojuegos populares con portadas en HD y metadatos
npm run db:seed:catalog --workspace=@crithit/api
```

---

## 🚂 3. Despliegue del Backend API en Railway

El backend está empaquetado en un contenedor Docker multi-stage (`Dockerfile`) con Node 20 Alpine, utilidades `dumb-init`, OpenSSL y usuario no privilegiado.

### 3.1. Pasos de Configuración en Railway
1. Iniciar sesión en [railway.app](https://railway.app).
2. Crear un nuevo proyecto: **New Project > Deploy from GitHub repo**.
3. Seleccionar el repositorio de **CritHit**.
4. En la configuración del servicio (**Settings**):
   - **Build**: Railway detectará automáticamente el archivo `railway.json` o `Dockerfile` en la raíz.
   - **Healthcheck Path**: `/api/health`
   - **Healthcheck Timeout**: `120` segundos.
   - **Restart Policy**: `On Failure` (máx. 5 reintentos).
5. Generar un dominio público:
   - Ir a **Settings > Networking > Generate Domain**.
   - Ejemplo: `crithit-api-production.up.railway.app` (o asociar dominio personalizado `api.crithit.gg`).

### 3.2. Variables de Entorno en Railway
En la pestaña **Variables**, añadir:

| Variable | Valor / Descripción | Requerido |
| :--- | :--- | :---: |
| `NODE_ENV` | `production` | Sí |
| `PORT` | `4000` (Railway inyecta su propio puerto si no se define) | Sí |
| `DATABASE_URL` | URL del Transaction Pooler de Supabase (puerto 6543) | Sí |
| `DIRECT_URL` | URL de conexión directa de Supabase (puerto 5432) | Sí |
| `JWT_SECRET` | Clave secreta criptográfica (min. 64 caracteres) | Sí |
| `JWT_REFRESH_SECRET` | Clave secreta de refresh token (min. 64 caracteres) | Sí |
| `CORS_ORIGINS` | `https://crithit.gg,https://crithit-web.vercel.app` | Sí |
| `RAWG_API_KEY` | Clave de API de RAWG | Sí |
| `GOOGLE_CLIENT_ID` | Client ID de Google OAuth 2.0 | Opcional |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth 2.0 | Opcional |
| `GOOGLE_CALLBACK_URL` | `https://api.crithit.gg/api/auth/google/callback` | Opcional |

### 3.3. Verificación de la API
Una vez finalizado el build en Railway, comprobar en el navegador:
- **Healthcheck**: `https://<tu-api-railway>.up.railway.app/api/health` ➔ Debe retornar `{"status":"ok","service":"crithit-api",...}`.
- **Documentación Swagger**: `https://<tu-api-railway>.up.railway.app/api/docs`.

---

## ⚡ 4. Despliegue del Frontend Web en Vercel

El frontend es una aplicación Next.js 14 App Router con soporte para Progressive Web App (PWA), renderizado híbrido (SSR/SSG), animaciones de inercia y Server Components optimizados.

### 4.1. Pasos de Configuración en Vercel
1. Iniciar sesión en [vercel.com](https://vercel.com).
2. Hacer clic en **Add New... > Project**.
3. Importar el repositorio de **CritHit**.
4. En **Project Settings**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `apps/web` (marcar *Include source files outside of the Root Directory in the Build Step* para que Turborepo resuelva `@crithit/shared`).
   - **Build Command**: `cd ../.. && npx turbo build --filter=@crithit/web...` (o dejar que Vercel use el `vercel.json` incluido).
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 4.2. Variables de Entorno en Vercel
En la sección **Environment Variables**:

| Variable | Valor / Ejemplo | Entornos |
| :--- | :--- | :---: |
| `NEXT_PUBLIC_API_URL` | `https://crithit-api-production.up.railway.app/api` | Production, Preview, Dev |
| `NEXT_PUBLIC_SITE_URL` | `https://crithit.gg` (o la URL de Vercel asignada) | Production, Preview, Dev |

### 4.3. Encabezados de Seguridad & PWA
El archivo `apps/web/vercel.json` ya incluye automáticamente:
- Prevención de ataques XSS y Clickjacking (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`).
- Cache-Control estricto para el Service Worker (`/sw.js` no se cachea en navegador para asegurar actualizaciones inmediatas).
- Caché inmutable de 1 año para iconos PWA (`/icons/*`).

---

## 🌐 5. Configuración de Dominios Personalizados (Opcional)

Si se dispone de un dominio propio (por ejemplo, `crithit.gg`):

### 5.1. Dominio Frontend (`crithit.gg`)
En el panel de Vercel (**Settings > Domains**):
1. Añadir `crithit.gg` y `www.crithit.gg`.
2. En tu registrador de dominio (Cloudflare, Namecheap, GoDaddy):
   - Registro `A` para `@` ➔ `76.76.21.21`
   - Registro `CNAME` para `www` ➔ `cname.vercel-dns.com`

### 5.2. Dominio API Backend (`api.crithit.gg`)
En el panel de Railway (**Settings > Networking > Custom Domain**):
1. Añadir `api.crithit.gg`.
2. En el registrador DNS:
   - Registro `CNAME` para `api` ➔ apuntar al target provisto por Railway (ej. `api.crithit.gg.railway.app`).

---

## ✅ 6. Checklist de Validación Post-Despliegue (Smoke Tests)

Una vez completados los despliegues en Railway y Vercel, ejecutar las siguientes verificaciones:

1. [ ] **Verificar Disponibilidad del Backend**:
   - Visitar `https://<api>/api/health` ➔ Responde HTTP 200 con `status: "ok"`.
2. [ ] **Verificar Disponibilidad de la Web**:
   - Visitar `https://<web>` ➔ Carga la portada con catálogo en tendencia y reseñas sin errores de consola.
3. [ ] **Verificar CORS**:
   - Abrir las herramientas de desarrollo del navegador (`F12` > Consola) en la web desplegada y confirmar que no haya advertencias de CORS al consultar la API.
4. [ ] **Flujo de Autenticación**:
   - Registrar una cuenta de prueba en `/register`.
   - Iniciar sesión en `/login` y comprobar que la navbar refleje el avatar y nombre del usuario.
5. [ ] **Flujo de Reseña & ScoreSlider Continuo**:
   - Ingresar a cualquier juego (ej: `/games/the-witcher-3-wild-hunt`).
   - Calificar con el selector de puntaje líquido y verificar que el color cambie en tiempo real.
   - Enviar una reseña y confirmar que aparezca en el feed del juego y en `/reviews`.
6. [ ] **Examen de Críticos**:
   - Ingresar a `/critics/exam`, realizar el examen y verificar que al aprobar se otorgue la insignia y el rol de crítico.
7. [ ] **Validación PWA**:
   - En Google Chrome / Edge, comprobar que aparezca el icono de instalación en la barra de direcciones o el banner interactivo.
   - Desconectar internet (Modo Offline en DevTools) y verificar que cargue `/offline`.
8. [ ] **Validación SEO & Social Cards**:
   - Pegar una URL de ficha de juego (ej. `https://<web>/games/elden-ring`) en Discord, Telegram o [opengraph.xyz](https://www.opengraph.xyz) y verificar que la carátula, título y sinopsis se muestren correctamente.

---

## 🛡️ 7. Mantenimiento, Backups & Escalabilidad

- **Copias de Seguridad**: Supabase realiza snapshots diarios automáticos de la base de datos PostgreSQL.
- **Escalado Horizontal**: Railway permite escalar réplicas del contenedor de la API con balanceo de carga interno ante incrementos de tráfico.
- **Edge Caching**: Vercel cachea automáticamente los Server Components estáticos en su red de distribución global (CDN) con revalidación incremental (ISR).
- **Logs y Diagnóstico**:
  - Backend: `railway logs` o consola de Railway para auditoría de excepciones.
  - Frontend: Pestaña *Logs* y *Analytics* en el panel de Vercel.
