import {
  Boton,
  BotonIcono,
  colores,
  IconoCheck,
  IconoFlecha,
  IconoNavegar,
  IconoSiguiente,
  Marca,
  radios,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import {
  CONDUCTOR,
  ESTUDIANTES,
  INSCRITOS_VUELTA,
  PARADAS_IDA,
  RUTA,
} from '../../../src/conductor/datos';
import { Pantalla } from '../../../src/conductor/Pantalla';
import { useRecorrido, type Navegador } from '../../../src/conductor/recorrido';

const fecha = new Intl.DateTimeFormat('es-CO', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
}).format(new Date());
const fechaCapitalizada = fecha.charAt(0).toUpperCase() + fecha.slice(1);

function Requisito({ texto }: { texto: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: colores.blancoTenue,
        borderRadius: radios.pildora,
        paddingVertical: 6,
        paddingHorizontal: 10,
      }}
    >
      <IconoCheck tamano={13} color={colores.naranja} grosor={3} />
      <Texto peso={600} tamano={12} color={colores.blanco}>
        {texto}
      </Texto>
    </View>
  );
}

function OpcionNavegador({
  valor,
  titulo,
  actual,
  onElegir,
}: {
  valor: Navegador;
  titulo: string;
  actual: Navegador;
  onElegir: (n: Navegador) => void;
}) {
  const activo = valor === actual;
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: activo }}
      onPress={() => onElegir(valor)}
      style={({ pressed }) => ({
        flex: 1,
        height: 44,
        borderRadius: 11,
        backgroundColor: activo ? colores.marino : 'transparent',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      {activo && <IconoNavegar tamano={16} color={colores.naranja} />}
      <Texto peso={700} tamano={15} color={activo ? colores.blanco : colores.marino}>
        {titulo}
      </Texto>
    </Pressable>
  );
}

export default function Hoy() {
  const router = useRouter();
  const { navegador, setNavegador, iniciar } = useRecorrido();
  const estudiantesIda = PARADAS_IDA.reduce((n, p) => n + p.estudiantes.length, 0);

  return (
    <Pantalla
      enPestana
      encabezado={
        <>
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Marca tamano={19} sobreOscuro />
            <BotonIcono
              accessibilityLabel="Menú de prueba"
              sobreOscuro
              onPress={() => router.navigate('/conductor/mas')}
            >
              <Texto peso={800} tamano={16} color={colores.blanco}>
                {CONDUCTOR.nombre.charAt(0)}
              </Texto>
            </BotonIcono>
          </View>
          <View style={{ gap: 4 }}>
            <Texto tamano={14} color={colores.grisClaro}>
              {fechaCapitalizada}
            </Texto>
            <Texto peso={800} tamano={30} interlineado={33} espaciado={-1.3} color={colores.blanco}>
              Buenos días, {CONDUCTOR.nombre}
            </Texto>
          </View>
          <View
            style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}
            accessible
            accessibilityLabel="El celular está listo para rastrear: ubicación precisa, permiso todo el tiempo y sin ahorro de batería"
          >
            <Requisito texto="Ubicación precisa" />
            <Requisito texto="Permiso todo el tiempo" />
            <Requisito texto="Sin ahorro de batería" />
          </View>
        </>
      }
    >
      <Texto peso={800} tamano={21} espaciado={-0.6}>
        Tus rutas de hoy
      </Texto>

      <View
        style={{
          borderWidth: 2,
          borderColor: colores.marino,
          borderRadius: 22,
          padding: 16,
          gap: 12,
        }}
      >
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}
        >
          <Texto peso={800} tamano={19} espaciado={-0.6}>
            {RUTA.nombre} · Ida
          </Texto>
          <Texto peso={700} tamano={14}>
            {RUTA.salidaIda}
          </Texto>
        </View>
        <Texto tamano={14} color={colores.gris}>
          {PARADAS_IDA.length} paradas · {estudiantesIda} estudiantes
        </Texto>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: colores.naranjaSuave,
            borderRadius: 12,
            paddingVertical: 9,
            paddingHorizontal: 12,
          }}
        >
          <View
            style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colores.naranja }}
          />
          <Texto tamano={14}>
            Hoy no va: <Texto peso={700}>{ESTUDIANTES.mateo.nombre}</Texto>
          </Texto>
        </View>
        <View style={{ gap: 6 }}>
          <Texto peso={700} tamano={13}>
            Navegar con
          </Texto>
          <View
            accessibilityRole="radiogroup"
            accessibilityLabel="App de navegación"
            style={{
              flexDirection: 'row',
              gap: 6,
              backgroundColor: colores.superficie,
              borderRadius: radios.boton,
              padding: 4,
            }}
          >
            <OpcionNavegador
              valor="waze"
              titulo="Waze"
              actual={navegador}
              onElegir={setNavegador}
            />
            <OpcionNavegador
              valor="maps"
              titulo="Google Maps"
              actual={navegador}
              onElegir={setNavegador}
            />
          </View>
        </View>
        <Boton
          titulo="Iniciar recorrido"
          variante="naranja"
          alto={58}
          tamanoTexto={18}
          iconoDerecha={<IconoFlecha tamano={20} color={colores.marino} />}
          onPress={() => {
            iniciar('ida');
            router.navigate('/conductor/recorrido');
          }}
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${RUTA.nombre}, regreso: abrir la lista de abordaje`}
        onPress={() => router.push('/conductor/abordaje')}
        style={({ pressed }) => ({
          backgroundColor: colores.superficie,
          borderRadius: 22,
          padding: 16,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        })}
      >
        <View style={{ flex: 1, gap: 4 }}>
          <Texto peso={800} tamano={17} espaciado={-0.4}>
            {RUTA.nombre} · Regreso
          </Texto>
          <Texto tamano={14} color={colores.gris}>
            {RUTA.salidaVuelta} · {INSCRITOS_VUELTA.length} inscritos · lista de abordaje
          </Texto>
        </View>
        <IconoSiguiente tamano={20} color={colores.gris} />
      </Pressable>
    </Pantalla>
  );
}
