import { Boton, Campo, colores, IconoCandado, IconoFlecha, Nota, Texto } from '@enruta2/ui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { CampoClave } from './CampoClave';
import { IconoCabecera, PantallaCuenta, type Modo } from './PantallaCuenta';
import { esCorreoValido, LARGO_MINIMO_CLAVE } from './reglas';

/** ¿Olvidaste tu contraseña? Paso 1: el correo al que llega el código. */
export function PedirCodigo({ modo }: { modo: Modo }) {
  const router = useRouter();
  const [correo, setCorreo] = useState('');
  const valido = esCorreoValido(correo);
  const conductor = modo === 'conductor';

  return (
    <PantallaCuenta
      modo={modo}
      titulo="Recupera tu contraseña"
      subtitulo="Escribe el correo de tu cuenta y te enviamos un código para crear una nueva."
      icono={
        <IconoCabecera>
          <IconoCandado tamano={28} color={colores.naranjaIcono} />
        </IconoCabecera>
      }
      pie={
        <Boton
          titulo="Enviar código"
          variante={conductor ? 'naranja' : 'marino'}
          deshabilitado={!valido}
          iconoDerecha={
            <IconoFlecha
              tamano={18}
              color={!valido ? colores.gris : conductor ? colores.marino : colores.blanco}
            />
          }
          onPress={() =>
            router.push({
              pathname: conductor ? '/conductor/verificar' : '/acudiente/verificar',
              params: { correo: correo.trim().toLowerCase(), proposito: 'recuperar' },
            })
          }
        />
      }
    >
      <Campo
        etiqueta="Correo"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        placeholder="tu@correo.com"
        autoFocus
      />
      <Nota texto="Por seguridad, la respuesta es la misma exista o no una cuenta con ese correo." />
    </PantallaCuenta>
  );
}

/** ¿Olvidaste tu contraseña? Paso 3, después del código: la contraseña nueva. */
export function NuevaClave({ modo }: { modo: Modo }) {
  const router = useRouter();
  const { correo } = useLocalSearchParams<{ correo?: string }>();
  const [clave, setClave] = useState('');
  const [repetir, setRepetir] = useState('');
  const conductor = modo === 'conductor';
  const larga = clave.length >= LARGO_MINIMO_CLAVE;
  const iguales = clave === repetir;
  const listo = larga && iguales;

  const guardar = () =>
    Alert.alert('Contraseña actualizada', 'Ya puedes entrar con tu contraseña nueva.', [
      {
        text: 'Entrar',
        onPress: () => router.dismissTo(conductor ? '/conductor/entrar' : '/acudiente/entrar'),
      },
    ]);

  return (
    <PantallaCuenta
      modo={modo}
      titulo="Crea una contraseña nueva"
      subtitulo={correo ? `Para la cuenta ${correo}.` : undefined}
      icono={
        <IconoCabecera>
          <IconoCandado tamano={28} color={colores.naranjaIcono} />
        </IconoCabecera>
      }
      pie={
        <Boton
          titulo="Guardar contraseña"
          variante={conductor ? 'naranja' : 'marino'}
          deshabilitado={!listo}
          onPress={guardar}
        />
      }
    >
      <View style={{ gap: 4 }}>
        <CampoClave
          etiqueta="Contraseña nueva"
          value={clave}
          onChangeText={setClave}
          autoComplete="new-password"
          autoFocus
        />
        <Texto tamano={13} color={larga ? colores.naranjaTexto : colores.gris}>
          {larga ? '✓ Largo suficiente' : `Mínimo ${LARGO_MINIMO_CLAVE} caracteres`}
        </Texto>
      </View>
      <View style={{ gap: 4 }}>
        <CampoClave
          etiqueta="Repítela"
          value={repetir}
          onChangeText={setRepetir}
          autoComplete="new-password"
        />
        {repetir !== '' && !iguales && (
          <Texto tamano={13} color={colores.error}>
            Las dos contraseñas no coinciden.
          </Texto>
        )}
      </View>
      <Nota texto="Al guardarla se cierra la sesión en los demás celulares donde hayas entrado." />
    </PantallaCuenta>
  );
}
