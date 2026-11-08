# 0012 — Correo transaccional con Resend

- **Estado:** Aceptada
- **Fecha:** 2026-11-08

## Contexto

Las cuentas de acudientes y conductores se activan con un código de 6 dígitos que llega al correo, y la contraseña se recupera igual (spec, sección 6.7). Es correo transaccional: pocos mensajes, pero tienen que llegar en segundos y no caer en spam. El correo lleva la identidad de la app (cabecera con el mapa o azul marino), así que necesita imágenes incrustadas.

## Opciones consideradas

1. **Gmail por SMTP** con una contraseña de aplicación: gratis e inmediato, pero el remitente es una dirección `@gmail.com`, Google limita los envíos diarios y no está pensado para correos de una aplicación.
2. **Amazon SES:** el más barato a escala, pero exige salir del modo _sandbox_ con una solicitud a AWS y configurar más piezas.
3. **Resend:** API REST simple, plan gratis suficiente para el piloto (3.000 correos al mes, 100 al día), dominio propio con SPF, DKIM y DMARC, imágenes incrustadas por `content_id` y claves de idempotencia.

## Decisión

Opción 3. La API llama a `POST https://api.resend.com/emails` con `fetch`, sin SDK ni dependencias nuevas (`apps/api/src/mail/transports/resend.transport.ts`).

- Remitente: `Enruta2 <no-responder@correo.<dominio>>`, en un subdominio para que la reputación del correo no afecte al dominio principal.
- La cabecera de cada modo es un PNG incrustado (`cid:`); el resto es HTML con tablas y estilos en línea, y versión en texto plano.
- Sin `RESEND_API_KEY`, en desarrollo los correos se guardan como HTML en `apps/api/tmp/correos`. En producción la clave y el remitente son obligatorios (la API no arranca sin ellos).
- El envío pasa por la interfaz `MailTransport`: cambiar de proveedor es escribir otro transporte.

## Consecuencias

- Hace falta un dominio propio con los registros DNS de Resend (ver [puesta en marcha](../PUESTA-EN-MARCHA.md)).
- Con el plan gratis, el límite de 100 correos al día alcanza para el piloto; con más de una empresa hay que pasar al plan pago.
- Los logs registran el propósito, el modo y el id de Resend, nunca el correo ni el código.
