import { Boton, Campo, colores, IconoFlecha, Nota, Texto } from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { useEstado } from '../../../src/acudiente/estado';
import { PasoInscripcion } from '../../../src/acudiente/PasoInscripcion';

/** Paso 1: el código de la ruta y los datos mínimos del estudiante. */
export default function PasoEstudiante() {
  const router = useRouter();
  const { borrador, setBorrador } = useEstado();
  const listo =
    borrador.codigo.trim().length >= 4 && borrador.nombre.trim() && borrador.apellido.trim();

  return (
    <PasoInscripcion
      paso={1}
      pie={
        <Boton
          titulo="Continuar"
          deshabilitado={!listo}
          iconoDerecha={<IconoFlecha tamano={18} color={listo ? colores.blanco : colores.gris} />}
          onPress={() => router.push('/acudiente/inscripcion/direccion')}
        />
      }
    >
      <View style={{ gap: 6 }}>
        <Texto peso={800} tamano={27} interlineado={30} espaciado={-1.1}>
          ¿A quién vas a inscribir?
        </Texto>
        <Texto tamano={14} color={colores.gris}>
          Si tienes varios hijos, inscribe a cada uno con su información. Luego los eliges en la
          app.
        </Texto>
      </View>

      <Campo
        etiqueta="Código de la ruta"
        detalle="te lo comparte el conductor"
        value={borrador.codigo}
        onChangeText={(codigo) => setBorrador({ codigo: codigo.toUpperCase() })}
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={8}
        style={{ fontFamily: 'HankenGrotesk_800ExtraBold', fontSize: 20, letterSpacing: 4 }}
      />
      <Campo
        etiqueta="Nombres del estudiante"
        value={borrador.nombre}
        onChangeText={(nombre) => setBorrador({ nombre })}
        placeholder="Por ejemplo: Sofía"
        autoCapitalize="words"
      />
      <Campo
        etiqueta="Apellidos"
        value={borrador.apellido}
        onChangeText={(apellido) => setBorrador({ apellido })}
        autoCapitalize="words"
      />

      <Nota texto="Solo pedimos los datos necesarios para el recorrido. Al crear tu cuenta aceptaste la autorización de tratamiento de datos (Ley 1581)." />
    </PasoInscripcion>
  );
}
