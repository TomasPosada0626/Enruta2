// Historial de avisos de ejemplo para la pestaña Avisos de los acudientes.

export type AvisoAcudiente = {
  id: string;
  hijo: string;
  titulo: string;
  detalle: string;
  nuevo: boolean;
};

export const AVISOS_ACUDIENTE: AvisoAcudiente[] = [
  {
    id: 'a1',
    hijo: 'Pablo',
    titulo: 'La ruta va en camino por Pablo',
    detalle: 'Llega en unos 8 min · Ruta Norte · 6:21 a. m.',
    nuevo: true,
  },
  {
    id: 'a2',
    hijo: 'Pablo',
    titulo: 'La ruta de Pablo ya salió',
    detalle: 'Ruta Norte · 6:02 a. m.',
    nuevo: true,
  },
  {
    id: 'a3',
    hijo: 'Emma',
    titulo: 'Emma llegó a casa',
    detalle: 'Ruta Sur · ayer, 2:51 p. m.',
    nuevo: false,
  },
  {
    id: 'a4',
    hijo: 'Pablo',
    titulo: 'Pablo quedó inscrito en la Ruta Norte',
    detalle: '3 de noviembre',
    nuevo: false,
  },
];
