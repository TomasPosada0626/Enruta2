# 0010 — Navegación con Waze o Google Maps, parada por parada

- **Estado:** Aceptada
- **Fecha:** 2026-11-08

## Contexto

El conductor necesita indicaciones para llegar a cada parada, y en Medellín ya usa Waze o Google Maps, que tienen tráfico en vivo. Enruta2 decide el **orden** de las paradas ([ADR 0004](0004-osrm-vroom.md)) y necesita saber hacia qué parada va el vehículo en cada momento, para avisarle a ese acudiente que la ruta va en camino y cuándo llegó.

## Opciones consideradas

1. **Un enlace con todas las paradas:** la guía de Google pide no mandar varias paradas en un enlace (Google Maps o Waze muestran un error) y Waze solo acepta un destino. Además, Enruta2 no sabría en qué parada va el conductor.
2. **Navegación dentro de la app con el Navigation SDK de Google:** hasta 25 paradas por ruta, pero se paga por destino (1.000 gratis al mes; una ruta del piloto usa unos 660) y es bastante más trabajo de integración.
3. **Un enlace por parada**, abriendo Waze o Google Maps según lo que elija el conductor.

## Decisión

Opción 3:

- Al iniciar el recorrido, el conductor elige Waze o Google Maps; la elección se recuerda en el celular.
- **Ir a la parada** abre la app elegida con las **coordenadas del pin confirmado** (no con el texto de la dirección, que se geocodifica mal):
  - Waze: `https://waze.com/ul?ll={lat},{lon}&navigate=yes`
  - Google Maps: `https://www.google.com/maps/dir/?api=1&destination={lat},{lon}&travelmode=driving&dir_action=navigate`
- Al llegar (la app del conductor lo detecta con su GPS), una notificación local _"Llegaste donde {nombre}. Toca para marcar"_ lo devuelve a Enruta2. Marca la parada y se habilita **Ir a la siguiente**.

## Consecuencias

- Sin costo ni clave de API, y con tráfico en vivo entre parada y parada: Enruta2 decide el orden y Waze o Google Maps, el camino.
- Enruta2 queda en segundo plano casi todo el recorrido. El rastreo depende del servicio en primer plano ([ADR 0003](0003-ubicacion-segundo-plano.md)), y la prueba de la Etapa 1 se hace con Waze en primer plano.
- Enruta2 no puede leer los tiempos ni el camino de Waze o Google Maps: la hora estimada sigue siendo la de OSRM, recalculada desde la posición real.
- A Waze o Google Maps solo salen las coordenadas de la parada siguiente, desde el celular del conductor y sin nombres. La política de privacidad lo debe mencionar.
- Si más adelante se quiere la navegación dentro de la app, el Navigation SDK es el camino, con costo por destino.

## Fuentes

- [Launch Google Maps or Waze](https://developers.google.com/maps/documentation/navigation/connect/launch-navigation-app) (Google)
- [Waze deep links](https://developers.google.com/waze/api)
- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/guide)
- [Navigation SDK for Android: usage and billing](https://developers.google.com/maps/documentation/navigation/android-sdk/pricing)
