import {
  Boton,
  Campo,
  colores,
  IconoFlecha,
  IconoUbicacion,
  PinParada,
  radios,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import {
  MUNICIPIOS,
  TIPOS_DE_VIA,
  textoDireccionCompleta,
  useEstado,
} from '../../../src/acudiente/estado';
import { Opciones, PasoInscripcion } from '../../../src/acudiente/PasoInscripcion';

function Separador({ texto }: { texto: string }) {
  return (
    <Texto peso={800} tamano={18} color={colores.gris} accessibilityElementsHidden>
      {texto}
    </Texto>
  );
}

export default function PasoDireccion() {
  const router = useRouter();
  const { borrador, setDireccionBorrador: setDireccion } = useEstado();
  const d = borrador.direccion;
  const nombre = borrador.nombre.trim() || 'tu hijo';
  const completa = d.numero.trim() && d.cruce.trim() && d.placa.trim() && d.barrio.trim();

  return (
    <PasoInscripcion
      paso={2}
      pie={
        <Boton
          titulo="Ver en el mapa"
          deshabilitado={!completa}
          iconoDerecha={
            <IconoFlecha tamano={18} color={completa ? colores.blanco : colores.gris} />
          }
          onPress={() => router.push('/acudiente/inscripcion/mapa')}
        />
      }
    >
      <View
        style={{
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 7,
          backgroundColor: colores.superficie,
          borderRadius: radios.pildora,
          paddingVertical: 7,
          paddingHorizontal: 12,
        }}
      >
        <PinParada tamano={16} centro={colores.naranja} />
        <Texto peso={600} tamano={13}>
          Ruta Norte · código {borrador.codigo}
        </Texto>
      </View>

      <View style={{ gap: 6 }}>
        <Texto peso={800} tamano={27} interlineado={30} espaciado={-1.1}>
          ¿Dónde recogen y dejan a {nombre}?
        </Texto>
        <Texto tamano={14} color={colores.gris}>
          Escribe la dirección exacta. En el siguiente paso la confirmas en el mapa.
        </Texto>
      </View>

      <Opciones
        etiqueta="Municipio"
        opciones={MUNICIPIOS}
        valor={d.municipio}
        onElegir={(municipio) => setDireccion({ municipio })}
      />

      <Campo
        etiqueta="Barrio"
        value={d.barrio}
        onChangeText={(barrio) => setDireccion({ barrio })}
      />

      <Opciones
        etiqueta="Dirección"
        opciones={TIPOS_DE_VIA}
        valor={d.via}
        onElegir={(via) => setDireccion({ via })}
      />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Campo
          etiqueta="Número de la vía"
          etiquetaOculta
          value={d.numero}
          onChangeText={(numero) => setDireccion({ numero })}
          autoCapitalize="characters"
          estilo={{ flex: 1.2 }}
          style={{ textAlign: 'center', fontFamily: 'HankenGrotesk_700Bold' }}
        />
        <Separador texto="#" />
        <Campo
          etiqueta="Número de la vía que cruza"
          etiquetaOculta
          value={d.cruce}
          onChangeText={(cruce) => setDireccion({ cruce })}
          autoCapitalize="characters"
          estilo={{ flex: 1 }}
          style={{ textAlign: 'center', fontFamily: 'HankenGrotesk_700Bold' }}
        />
        <Separador texto="-" />
        <Campo
          etiqueta="Placa"
          etiquetaOculta
          value={d.placa}
          onChangeText={(placa) => setDireccion({ placa })}
          keyboardType="number-pad"
          estilo={{ flex: 1 }}
          style={{ textAlign: 'center', fontFamily: 'HankenGrotesk_700Bold' }}
        />
      </View>

      <Campo
        etiqueta="Complemento"
        value={d.complemento}
        onChangeText={(complemento) => setDireccion({ complemento })}
        placeholder="Unidad, torre, apartamento o casa"
      />
      <Campo
        etiqueta="Indicaciones para el conductor"
        detalle="opcional"
        value={d.indicaciones}
        onChangeText={(indicaciones) => setDireccion({ indicaciones })}
        placeholder="Por ejemplo: casa de reja verde"
      />

      <View
        style={{
          flexDirection: 'row',
          gap: 10,
          backgroundColor: colores.superficie,
          borderRadius: 16,
          padding: 14,
        }}
      >
        <View style={{ marginTop: 2 }}>
          <IconoUbicacion tamano={18} color={colores.naranjaIcono} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Texto peso={600} tamano={12} color={colores.gris}>
            Así queda
          </Texto>
          <Texto peso={700} tamano={15}>
            {textoDireccionCompleta(d)}
          </Texto>
        </View>
      </View>
    </PasoInscripcion>
  );
}
