import {
  colores,
  Fila,
  IconoPersonaNo,
  IconoPortapapeles,
  IconoRuta,
  radios,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { AVISOS, RUTA, type Aviso } from '../../../src/conductor/datos';
import { Pantalla } from '../../../src/conductor/Pantalla';

const ICONOS: Record<Aviso['tipo'], typeof IconoRuta> = {
  noVa: IconoPersonaNo,
  inscripcion: IconoPortapapeles,
  recorrido: IconoRuta,
};

export default function Avisos() {
  const router = useRouter();
  const nuevos = AVISOS.filter((a) => a.nuevo).length;

  return (
    <Pantalla
      enPestana
      encabezado={
        <View style={{ gap: 4, paddingTop: 8 }}>
          <Texto peso={600} tamano={14} color={colores.grisClaro}>
            {RUTA.nombre} · {nuevos} {nuevos === 1 ? 'nuevo' : 'nuevos'}
          </Texto>
          <Texto peso={800} tamano={30} interlineado={33} espaciado={-1.3} color={colores.blanco}>
            Avisos
          </Texto>
        </View>
      }
    >
      {AVISOS.map((a) => {
        const Icono = ICONOS[a.tipo];
        return (
          <Fila
            key={a.id}
            titulo={a.titulo}
            detalle={`${a.detalle} · ${a.hora}`}
            accessibilityLabel={`${a.nuevo ? 'Nuevo. ' : ''}${a.titulo}. ${a.detalle}. ${a.hora}`}
            izquierda={
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: a.nuevo ? colores.naranja : colores.blanco,
                }}
              >
                <Icono tamano={20} color={colores.marino} />
              </View>
            }
            derecha={
              a.nuevo ? (
                <View
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: radios.pildora,
                    backgroundColor: colores.naranja,
                  }}
                />
              ) : undefined
            }
            onPress={a.tipo === 'inscripcion' ? () => router.push('/conductor/aprobar') : undefined}
          />
        );
      })}
    </Pantalla>
  );
}
