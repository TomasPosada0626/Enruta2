import {
  Boton,
  Cifra,
  colores,
  IconoCampana,
  IconoCheck,
  IconoCheckCirculo,
  IconoEquis,
  IconoFlecha,
  IconoGps,
  IconoNavegar,
  IconoPorteria,
  Nota,
  radios,
  Segmentos,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { Alert, Linking, View } from 'react-native';

import { RUTA, type Estudiante, type Parada } from '../src/datos';
import { Pantalla } from '../src/Pantalla';
import { urlNavegacion, useRecorrido, type Marca } from '../src/recorrido';

const NOMBRE_NAVEGADOR = { waze: 'Waze', maps: 'Google Maps' } as const;

const ETIQUETA_MARCA: Record<Marca, string> = {
  recogido: 'Recogido',
  noSalio: 'No salió',
  entregado: 'Entregado',
  nadieRecibio: 'Nadie lo recibió',
};

function ChipGps() {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: colores.blancoTenue,
        borderRadius: radios.pildora,
        paddingVertical: 8,
        paddingHorizontal: 12,
      }}
    >
      <IconoGps tamano={15} color={colores.blanco} />
      <Texto peso={700} tamano={13} color={colores.blanco}>
        GPS activo · 8 m
      </Texto>
    </View>
  );
}

function FilaSuperior({ sentido }: { sentido: 'ida' | 'vuelta' }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 44,
      }}
    >
      <Texto peso={700} tamano={15} color={colores.grisClaro}>
        {RUTA.nombre} · {sentido === 'ida' ? 'Ida' : 'Regreso'}
      </Texto>
      <ChipGps />
    </View>
  );
}

function Direccion({ parada, grande = false }: { parada: Parada; grande?: boolean }) {
  return (
    <View style={{ gap: 3 }}>
      <Texto peso={800} tamano={grande ? 27 : 23} interlineado={grande ? 30 : 26} espaciado={-1}>
        {parada.direccion}
      </Texto>
      <Texto tamano={15} color={colores.gris}>
        {parada.complemento}
      </Texto>
      {parada.indicaciones && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 4 }}>
          <IconoPorteria tamano={16} color={colores.naranjaIcono} />
          <Texto peso={700} tamano={15}>
            {parada.indicaciones}
          </Texto>
        </View>
      )}
    </View>
  );
}

function abrirNavegacion(url: string, nombre: string) {
  Linking.openURL(url).catch(() =>
    Alert.alert('No se pudo abrir la navegación', `Revisa que ${nombre} esté instalado.`),
  );
}

export default function Recorrido() {
  const router = useRouter();
  const r = useRecorrido();
  const total = r.paradas.length;

  if (r.fase === 'terminado' || !r.parada) {
    return (
      <Pantalla
        encabezado={
          <>
            <FilaSuperior sentido={r.sentido} />
            <Segmentos total={Math.max(total, 1)} actual={total + 1} sobreOscuro />
            <Texto peso={800} tamano={34} interlineado={37} espaciado={-1.5} color={colores.blanco}>
              {r.sentido === 'ida' ? 'Llegaron al colegio' : 'Todos llegaron a casa'}
            </Texto>
          </>
        }
        pie={<Boton titulo="Volver a mis rutas" onPress={() => router.replace('/hoy')} />}
      >
        <Nota
          icono={<IconoCampana tamano={18} />}
          texto={
            r.sentido === 'ida'
              ? 'Los acudientes recibieron el aviso de llegada al colegio y su seguimiento en vivo se cerró.'
              : 'Cada acudiente recibió el aviso de entrega y su seguimiento en vivo se cerró.'
          }
        />
      </Pantalla>
    );
  }

  const parada = r.parada;
  const siguiente = r.paradas[r.indice + 1];
  const navegador = NOMBRE_NAVEGADOR[r.navegador];
  const url = urlNavegacion(r.navegador, parada);

  if (r.fase === 'enCamino') {
    return (
      <Pantalla
        encabezado={
          <>
            <FilaSuperior sentido={r.sentido} />
            <Segmentos total={total} actual={r.indice + 1} sobreOscuro />
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
              }}
            >
              <View style={{ gap: 2 }}>
                <Texto peso={600} tamano={14} color={colores.grisClaro}>
                  Vas a la parada
                </Texto>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Cifra color={colores.blanco}>{r.indice + 1}</Cifra>
                  <Texto peso={700} tamano={24} color={colores.grisClaro}>
                    de {total}
                  </Texto>
                </View>
              </View>
              <View style={{ gap: 2, alignItems: 'flex-end' }}>
                <Texto peso={600} tamano={14} color={colores.grisClaro}>
                  Llegas en
                </Texto>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                  <Cifra color={colores.naranja}>{parada.minutos}</Cifra>
                  <Texto peso={700} tamano={24} color={colores.naranja}>
                    min
                  </Texto>
                </View>
              </View>
            </View>
          </>
        }
      >
        <View style={{ gap: 4 }}>
          <Texto peso={700} tamano={13} color={colores.gris}>
            Siguiente parada
          </Texto>
          <Direccion parada={parada} grande />
        </View>

        <View style={{ gap: 8 }}>
          <Texto peso={700} tamano={13} color={colores.gris}>
            {r.sentido === 'ida' ? 'Recoges a' : 'Entregas a'}
          </Texto>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {parada.estudiantes.map((e) => (
              <View
                key={e.id}
                style={{
                  backgroundColor: colores.marinoSuave,
                  borderRadius: radios.pildora,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                }}
              >
                <Texto peso={700} tamano={15}>
                  {e.nombre}
                </Texto>
              </View>
            ))}
          </View>
        </View>

        <Boton
          titulo={`Abrir en ${navegador}`}
          variante="naranja"
          alto={62}
          tamanoTexto={19}
          icono={<IconoNavegar tamano={22} color={colores.marino} />}
          onPress={() => abrirNavegacion(url, navegador)}
        />

        <Nota
          icono={<IconoCampana tamano={18} />}
          texto="Los acudientes ya saben que vas en camino. Al llegar te avisamos para que vuelvas a Enruta2."
        />

        <View
          style={{
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: colores.bordeFuerte,
            borderRadius: 18,
            padding: 12,
            gap: 10,
          }}
        >
          <Texto peso={800} tamano={12} espaciado={0.6} color={colores.gris}>
            SOLO EN EL PROTOTIPO
          </Texto>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Boton
              titulo="Simular llegada"
              variante="contorno"
              alto={46}
              tamanoTexto={14}
              estilo={{ flex: 1, paddingHorizontal: 8 }}
              onPress={r.llegar}
            />
            <Boton
              titulo="Simular «no va»"
              variante="contornoNaranja"
              alto={46}
              tamanoTexto={14}
              estilo={{ flex: 1, paddingHorizontal: 8 }}
              onPress={() => router.push('/aviso-no-va')}
            />
          </View>
        </View>

        {siguiente && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              borderTopWidth: 1,
              borderTopColor: colores.lineaSuave,
              paddingTop: 14,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                backgroundColor: colores.superficie,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Texto peso={800} tamano={15}>
                {r.indice + 2}
              </Texto>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Texto peso={700} tamano={13} color={colores.gris}>
                Después
              </Texto>
              <Texto peso={700} tamano={15}>
                {siguiente.direccion} · {siguiente.estudiantes.length}{' '}
                {siguiente.estudiantes.length === 1 ? 'estudiante' : 'estudiantes'}
              </Texto>
            </View>
          </View>
        )}
      </Pantalla>
    );
  }

  // En la parada: se marca a cada estudiante antes de seguir.
  const pendientes = parada.estudiantes.filter((e) => !r.marcas[e.id]);
  const esUltima = r.indice === total - 1;
  const tituloSiguiente = esUltima
    ? r.sentido === 'ida'
      ? 'Ir al colegio'
      : 'Terminar recorrido'
    : 'Ir a la siguiente';

  const opciones: [Marca, Marca] =
    r.sentido === 'ida' ? ['recogido', 'noSalio'] : ['entregado', 'nadieRecibio'];

  return (
    <Pantalla
      encabezado={
        <>
          <FilaSuperior sentido={r.sentido} />
          <Segmentos total={total} actual={r.indice + 1} sobreOscuro />
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
            }}
          >
            <View style={{ gap: 2 }}>
              <Texto peso={600} tamano={14} color={colores.grisClaro}>
                Parada
              </Texto>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                <Cifra color={colores.blanco}>{r.indice + 1}</Cifra>
                <Texto peso={700} tamano={24} color={colores.grisClaro}>
                  de {total}
                </Texto>
              </View>
            </View>
            <Boton
              titulo={`Abrir ${navegador}`}
              variante="contornoClaro"
              alto={46}
              tamanoTexto={14}
              icono={<IconoNavegar tamano={16} color={colores.naranja} />}
              onPress={() => abrirNavegacion(url, navegador)}
            />
          </View>
        </>
      }
      superpuesto={
        <View
          style={{
            backgroundColor: colores.naranja,
            borderRadius: 18,
            paddingVertical: 13,
            paddingHorizontal: 16,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
          accessibilityRole="alert"
        >
          <IconoCheckCirculo tamano={32} color={colores.marino} />
          <View style={{ gap: 1 }}>
            <Texto peso={800} tamano={23} interlineado={26} espaciado={-0.7}>
              Llegaste
            </Texto>
            <Texto peso={600} tamano={14}>
              Estás a 12 m de la dirección
            </Texto>
          </View>
        </View>
      }
      pie={
        <>
          <Boton
            titulo={tituloSiguiente}
            alto={58}
            deshabilitado={pendientes.length > 0}
            iconoDerecha={
              <IconoFlecha
                tamano={18}
                color={pendientes.length > 0 ? colores.gris : colores.naranja}
              />
            }
            onPress={r.siguiente}
          />
          {pendientes.length > 0 && (
            <Texto tamano={13} color={colores.gris} style={{ alignSelf: 'center' }}>
              Marca a {pendientes.map((e) => e.nombre.split(' ')[0]).join(' y ')} para seguir
            </Texto>
          )}
        </>
      }
    >
      <Direccion parada={parada} />

      {parada.estudiantes.map((e) => (
        <FilaEstudiante
          key={e.id}
          estudiante={e}
          marca={r.marcas[e.id]}
          hora={r.horas[e.id]}
          opciones={opciones}
          onMarcar={(m) => r.marcar(e.id, m)}
        />
      ))}
    </Pantalla>
  );
}

function FilaEstudiante({
  estudiante,
  marca,
  hora,
  opciones,
  onMarcar,
}: {
  estudiante: Estudiante;
  marca: Marca | undefined;
  hora: string | undefined;
  opciones: [Marca, Marca];
  onMarcar: (m: Marca) => void;
}) {
  if (marca) {
    const positiva = marca === 'recogido' || marca === 'entregado';
    return (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: colores.superficie,
          borderRadius: 16,
          paddingVertical: 11,
          paddingLeft: 16,
          paddingRight: 12,
          gap: 8,
        }}
      >
        <Texto peso={700} tamano={17} style={{ flexShrink: 1 }}>
          {estudiante.nombre}
        </Texto>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            backgroundColor: positiva ? colores.marinoSuave : colores.naranjaSuave,
            borderRadius: radios.pildora,
            paddingVertical: 6,
            paddingHorizontal: 11,
          }}
        >
          {positiva ? (
            <IconoCheck tamano={14} color={colores.marino} />
          ) : (
            <IconoEquis tamano={13} color={colores.naranjaTexto} />
          )}
          <Texto peso={700} tamano={13} color={positiva ? colores.marino : colores.naranjaTexto}>
            {ETIQUETA_MARCA[marca]}
            {hora ? ` · ${hora}` : ''}
          </Texto>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: colores.marino,
        borderRadius: 18,
        padding: 12,
        gap: 10,
      }}
    >
      <Texto peso={700} tamano={17} style={{ paddingLeft: 4 }}>
        {estudiante.nombre}
      </Texto>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Boton
          titulo={ETIQUETA_MARCA[opciones[0]]}
          alto={56}
          estilo={{ flex: 1, paddingHorizontal: 8 }}
          icono={<IconoCheck tamano={18} color={colores.naranja} />}
          accessibilityLabel={`${ETIQUETA_MARCA[opciones[0]]}: ${estudiante.nombre}`}
          onPress={() => onMarcar(opciones[0])}
        />
        <Boton
          titulo={ETIQUETA_MARCA[opciones[1]]}
          variante="contornoNaranja"
          alto={56}
          tamanoTexto={opciones[1] === 'nadieRecibio' ? 14 : 17}
          estilo={{ flex: 1, paddingHorizontal: 8 }}
          icono={<IconoEquis tamano={16} color={colores.naranjaIcono} />}
          accessibilityLabel={`${ETIQUETA_MARCA[opciones[1]]}: ${estudiante.nombre}`}
          onPress={() => onMarcar(opciones[1])}
        />
      </View>
    </View>
  );
}
