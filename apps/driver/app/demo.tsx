import { BotonIcono, colores, IconoAtras, IconoSiguiente, Texto } from '@enruta2/ui';
import { useRouter, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Pantalla } from '../src/Pantalla';

const OPCIONES: { titulo: string; detalle: string; ruta: Href }[] = [
  {
    titulo: 'Aviso: un estudiante no va',
    detalle: 'Llega mientras vas en camino a su parada',
    ruta: '/aviso-no-va',
  },
  { titulo: 'GPS apagado', detalle: 'Alerta que no se puede cerrar', ruta: '/gps' },
  { titulo: 'Aprobar una inscripción', detalle: 'Vista del administrador', ruta: '/aprobar' },
  { titulo: 'Lista de abordaje', detalle: 'Armar la vuelta en el colegio', ruta: '/abordaje' },
  { titulo: 'Cerrar sesión', detalle: 'Volver a la pantalla de entrada', ruta: '/entrar' },
];

/** Atajos para probar el prototipo en el celular. No existe en la app real. */
export default function Demo() {
  const router = useRouter();
  return (
    <Pantalla
      encabezado={
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 46 }}>
            <BotonIcono accessibilityLabel="Volver" sobreOscuro onPress={() => router.back()}>
              <IconoAtras tamano={20} color={colores.blanco} />
            </BotonIcono>
          </View>
          <Texto peso={800} tamano={30} interlineado={33} espaciado={-1.3} color={colores.blanco}>
            Menú de prueba
          </Texto>
          <Texto tamano={15} color={colores.grisClaro}>
            Atajos para ver las pantallas del prototipo. No existe en la app real.
          </Texto>
        </>
      }
    >
      {OPCIONES.map((o) => (
        <Pressable
          key={o.titulo}
          accessibilityRole="button"
          onPress={() => (o.ruta === '/entrar' ? router.replace(o.ruta) : router.push(o.ruta))}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            backgroundColor: colores.superficie,
            borderRadius: 18,
            padding: 16,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          })}
        >
          <View style={{ flex: 1, gap: 3 }}>
            <Texto peso={800} tamano={17} espaciado={-0.3}>
              {o.titulo}
            </Texto>
            <Texto tamano={14} color={colores.gris}>
              {o.detalle}
            </Texto>
          </View>
          <IconoSiguiente tamano={20} color={colores.gris} />
        </Pressable>
      ))}
    </Pantalla>
  );
}
