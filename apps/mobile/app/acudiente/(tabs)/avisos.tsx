import { colores, Fila, radios, Texto } from '@enruta2/ui';
import { View } from 'react-native';

import { AVISOS_ACUDIENTE } from '../../../src/acudiente/avisos';
import { PaginaBlanca } from '../../../src/acudiente/PaginaBlanca';

export default function Avisos() {
  const nuevos = AVISOS_ACUDIENTE.filter((a) => a.nuevo).length;
  return (
    <PaginaBlanca titulo="Avisos" subtitulo={`${nuevos} ${nuevos === 1 ? 'nuevo' : 'nuevos'}`}>
      {AVISOS_ACUDIENTE.map((a) => (
        <Fila
          key={a.id}
          titulo={a.titulo}
          detalle={a.detalle}
          accessibilityLabel={`${a.nuevo ? 'Nuevo. ' : ''}${a.titulo}. ${a.detalle}`}
          izquierda={
            <View
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: a.nuevo ? colores.naranja : colores.blanco,
              }}
            >
              <Texto peso={800} tamano={16}>
                {a.hijo.charAt(0)}
              </Texto>
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
        />
      ))}
    </PaginaBlanca>
  );
}
