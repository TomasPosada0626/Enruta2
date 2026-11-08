# Imagen mínima con osmium-tool (paquete oficial de Debian) para recortar extractos de OpenStreetMap.
FROM debian:trixie-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends osmium-tool \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /data
ENTRYPOINT ["osmium"]
