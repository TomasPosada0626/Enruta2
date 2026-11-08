# Puesta en marcha: cuentas, llaves y servicios

Lo que hay que crear fuera del código para que Enruta2 funcione de verdad: correo, mapa, notificaciones, servidor y publicación. Está en el orden recomendado.

**Reglas para todos los pasos**

- Activa la verificación en dos pasos en cada cuenta y guarda cada clave en un gestor de contraseñas.
- Las claves nunca van al repositorio: van en `.env` (ignorado por git), en las variables de entorno de EAS o en los secretos de GitHub.

| #   | Servicio             | Para qué                                 | Costo                          |
| --- | -------------------- | ---------------------------------------- | ------------------------------ |
| 1   | Dominio + Cloudflare | Correo, HTTPS de la API, enlaces         | El dominio, al año             |
| 2   | Resend               | Código de verificación y de recuperación | Gratis hasta 3.000 correos/mes |
| 3   | Google Play Console  | Publicar la app                          | USD 25, una vez                |
| 4   | Expo + GitHub        | Actualizaciones OTA automáticas          | Gratis                         |
| 5   | Google Cloud         | Mapa real y geocodificación              | Según uso, con presupuesto     |
| 6   | Firebase             | Notificaciones push                      | Gratis                         |
| 7   | Servidor (VPS)       | API, PostGIS, Redis, OSRM y VROOM        | Mensual                        |

## 1. Dominio

1. Elige el nombre (por ejemplo, `enruta2.co`).
2. Cómpralo en **Cloudflare** (Domain Registration → Register Domains). Si no está disponible ahí, cómpralo en Namecheap o Porkbun y agrégalo a Cloudflare con **Add a site** (plan Free), cambiando los _nameservers_ en el registrador.
3. Se usa así: `api.<dominio>` para el servidor, `correo.<dominio>` para Resend y el dominio raíz para los enlaces de invitación.

## 2. Resend

1. Crea la cuenta en [resend.com](https://resend.com) y activa la verificación en dos pasos.
2. **Domains → Add Domain** → `correo.<dominio>`. Resend recomienda un subdominio y no el dominio raíz.
3. Copia en Cloudflare (DNS → Records) los registros que muestra Resend, exactos: un **MX** y un **TXT** (SPF) en `send.correo…` y un **TXT** (DKIM) en `resend._domainkey.correo…`. Si Resend ofrece configurarlos automáticamente con Cloudflare, úsalo.
4. Agrega un **TXT** `_dmarc` con el valor `v=DMARC1; p=none;`.
5. En Resend toca **Verify**. Suele tardar unos 15 minutos; puede tardar hasta 72 horas.
6. **API Keys → Create API Key** con permiso _Sending access_ y limitada al dominio: una `enruta2-local` y otra `enruta2-servidor`. Cada una se muestra una sola vez.
7. En `apps/api/.env`:

   ```bash
   RESEND_API_KEY=re_xxxxxxxx
   MAIL_FROM="Enruta2 <no-responder@correo.<dominio>>"
   MAIL_REPLY_TO=soporte@<dominio>   # opcional
   ```

8. Prueba: `pnpm correo --para tu@gmail.com` envía los dos correos (acudiente y conductor). Antes de verificar el dominio puedes probar sin `MAIL_FROM`: Resend usa su remitente de prueba, que solo entrega al correo con el que creaste la cuenta.
9. Opcional: en Cloudflare, **Email → Email Routing** crea `soporte@<dominio>` que reenvía a tu Gmail, para recibir las respuestas.

## 3. Google Play Console

1. [play.google.com/console/signup](https://play.google.com/console/signup) → cuenta **Personal** (USD 25).
2. Verificación de identidad (cédula) y del celular. Tarda días: empiézala pronto.
3. La prueba cerrada exige 12 testers durante 14 días (spec, sección 14.2): serán los acudientes de la ruta piloto.

## 4. Expo y GitHub

1. En expo.dev (cuenta `pawfound`): **Account settings → Security** → verificación en dos pasos. Esa cuenta puede publicar actualizaciones en todos los celulares.
2. **Account settings → Access tokens → Create token** (`github-ota`).
3. `gh secret set EXPO_TOKEN --repo TomasPosada0626/Enruta2` y pega el token. Desde ahí, cada push a `main` que cambie la app publica la actualización OTA ([`ota.yml`](../.github/workflows/ota.yml)).

## 5. Google Cloud: mapa y geocodificación

1. [console.cloud.google.com](https://console.cloud.google.com) → proyecto nuevo **Enruta2**.
2. **Facturación** → vincula una cuenta de facturación. Luego **Presupuestos y alertas** → presupuesto de USD 10 con alertas al 50, 90 y 100 %.
3. **APIs y servicios → Biblioteca** → habilita **Maps SDK for Android** y **Geocoding API**.
4. **Credenciales → Crear credenciales → Clave de API** `enruta2-app-mapas`:
   - Restricción de aplicación: **Apps de Android** → paquete `co.enruta2.app` + huella **SHA-1** (expo.dev → proyecto enruta2 → Credentials → Android → `co.enruta2.app`).
   - Restricción de API: solo **Maps SDK for Android**.
   - Guárdala en expo.dev → proyecto → **Environment variables** como `GOOGLE_MAPS_ANDROID_API_KEY` (visibilidad _Sensitive_, entornos preview y production).
5. Otra clave `enruta2-servidor-geocoding`, restringida a **Geocoding API** (y a la IP del servidor cuando exista). Va en `apps/api/.env` como `GOOGLE_GEOCODING_API_KEY`.
6. **Geocoding API → Cuotas** → limita las solicitudes por día (por ejemplo, 500).

## 6. Firebase: notificaciones push

1. [console.firebase.google.com](https://console.firebase.google.com) → **Agregar proyecto** → elige el proyecto de Google Cloud **Enruta2**. Sin Google Analytics.
2. Ícono de **Android** → paquete `co.enruta2.app` → **descarga `google-services.json`** y guárdalo en `apps/mobile/google-services.json` (git lo ignora). Los pasos del SDK no hacen falta: Expo se encarga.
3. **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**: descarga un JSON secreto.
4. expo.dev → proyecto → **Credentials → Android → `co.enruta2.app` → FCM V1 service account key** → sube ese JSON y bórralo de Descargas.

Con esto, el siguiente APK incluye el mapa real y las notificaciones push (son cambios nativos: no viajan por OTA).

## 7. Servidor

Cuando haya algo que desplegar (después de la Fase 1):

1. Cuenta en Hetzner Cloud (o DigitalOcean si Hetzner pide una verificación que no puedas completar).
2. Servidor con Ubuntu 24.04, **4 GB de RAM** (OSRM y VROOM viven en memoria), ubicación en EE. UU., IPv4 pública y firewall con los puertos 22, 80 y 443.
3. Llave SSH propia: `ssh-keygen -t ed25519 -f ~/.ssh/enruta2_servidor` y pega `enruta2_servidor.pub` al crear el servidor.
4. En Cloudflare, registro **A** `api` → IP del servidor, en modo _DNS only_.
5. El despliegue (Docker Compose, HTTPS con Caddy, PostGIS, Redis, OSRM, VROOM y la API) se hace desde el repo.

## 8. Lo que no es técnico

- Empresa piloto con 15 direcciones reales para probar la optimización.
- 12 acudientes dispuestos a ser testers durante 14 días.
- Texto de la autorización de tratamiento de datos (Ley 1581), revisado por un abogado.
