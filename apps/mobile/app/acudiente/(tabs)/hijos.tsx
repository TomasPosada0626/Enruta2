import {
  Boton,
  colores,
  Dias,
  IconoCompartir,
  IconoMas,
  Pildora,
  PinParada,
  radios,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { Alert, Share, View } from 'react-native';

import { textoDireccion, useEstado, type Hijo } from '../../../src/acudiente/estado';
import { PaginaBlanca } from '../../../src/acudiente/PaginaBlanca';

function EstadoHijo({ hijo }: { hijo: Hijo }) {
  if (hijo.estado === 'pendiente')
    return <Pildora texto="Pendiente" fondo={colores.naranjaSuave} color={colores.naranjaTexto} />;
  if (hijo.estado === 'enVivo')
    return (
      <Pildora
        texto="En vivo"
        fondo={colores.naranjaSuave}
        color={colores.naranjaTexto}
        punto={colores.naranja}
      />
    );
  return <Pildora texto={`Sale ${hijo.salidaIda}`} fondo={colores.superficie} />;
}

function TarjetaHijo({ hijo }: { hijo: Hijo }) {
  const router = useRouter();
  const { seleccionar } = useEstado();

  const agregarAcudiente = () =>
    Share.share({
      message: `Te invito a seguir a ${hijo.nombre} en Enruta2. Abre la app, elige «Soy acudiente» y usa la invitación que te llega en este mensaje.`,
    });

  return (
    <View
      style={{
        borderWidth: 1.5,
        borderColor: colores.linea,
        borderRadius: 24,
        padding: 16,
        gap: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colores.naranja,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Texto peso={800} tamano={20}>
            {hijo.nombre.charAt(0)}
          </Texto>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Texto peso={800} tamano={20} interlineado={23} espaciado={-0.6}>
            {hijo.nombre} {hijo.apellido}
          </Texto>
          <Texto tamano={13} color={colores.gris}>
            {hijo.ruta} · {hijo.colegio}
          </Texto>
        </View>
      </View>
      <EstadoHijo hijo={hijo} />

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          backgroundColor: colores.superficie,
          borderRadius: 14,
          padding: 12,
        }}
      >
        <PinParada tamano={18} centro={colores.naranja} />
        <View style={{ flex: 1, gap: 2 }}>
          <Texto peso={700} tamano={15}>
            {textoDireccion(hijo.direccion)}
          </Texto>
          <Texto tamano={13} color={colores.gris}>
            {hijo.direccion.complemento} · {hijo.direccion.barrio}
          </Texto>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Texto peso={800} tamano={15}>
            Ida
          </Texto>
          <Dias seleccionados={hijo.diasIda} compacto />
        </View>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <Texto peso={800} tamano={15}>
            Regreso
          </Texto>
          <Dias seleccionados={hijo.diasRegreso} compacto />
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Texto peso={800} tamano={13} espaciado={0.5} color={colores.gris}>
          ACUDIENTES
        </Texto>
        {hijo.acudientes.map((a) => (
          <View
            key={a.nombre}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Texto peso={700} tamano={15}>
              {a.nombre}
            </Texto>
            {a.principal && (
              <Texto peso={700} tamano={12} color={colores.naranjaTexto}>
                Principal
              </Texto>
            )}
          </View>
        ))}
        <Boton
          titulo="Agregar acudiente"
          variante="texto"
          alto={40}
          tamanoTexto={14}
          icono={<IconoCompartir tamano={16} color={colores.naranjaIcono} />}
          estilo={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
          onPress={agregarAcudiente}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {hijo.estado !== 'pendiente' && (
          <Boton
            titulo="Ver en vivo"
            alto={48}
            tamanoTexto={15}
            estilo={{ flex: 1, paddingHorizontal: 8 }}
            onPress={() => {
              seleccionar(hijo.id);
              router.navigate('/acudiente/inicio');
            }}
          />
        )}
        <Boton
          titulo="Avisar para otro día"
          variante="contorno"
          alto={48}
          tamanoTexto={14}
          estilo={{ flex: 1, paddingHorizontal: 8 }}
          onPress={() =>
            Alert.alert(
              'Avisar para otro día',
              `Aquí eliges la fecha y si ${hijo.nombre} no va a la ida, al regreso o a ninguno.`,
            )
          }
        />
      </View>
    </View>
  );
}

export default function Hijos() {
  const router = useRouter();
  const { hijos } = useEstado();
  return (
    <PaginaBlanca
      titulo="Tus hijos"
      subtitulo={`${hijos.length} ${hijos.length === 1 ? 'inscrito' : 'inscritos'}`}
      accion={
        <Boton
          titulo="Inscribir"
          variante="contorno"
          alto={44}
          tamanoTexto={14}
          icono={<IconoMas tamano={16} color={colores.naranjaIcono} />}
          onPress={() => router.push('/acudiente/inscripcion/estudiante')}
        />
      }
    >
      {hijos.map((h) => (
        <TarjetaHijo key={h.id} hijo={h} />
      ))}
      <View style={{ height: radios.boton }} />
    </PaginaBlanca>
  );
}
