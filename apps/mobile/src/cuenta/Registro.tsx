import { Boton, Campo, colores, IconoFlecha, IconoPersona, Nota, radios, Texto } from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { CampoClave } from './CampoClave';
import { IconoCabecera, PantallaCuenta, type Modo } from './PantallaCuenta';
import { esCelularValido, esCorreoValido, LARGO_MINIMO_CLAVE } from './reglas';

type Vinculo = 'empresa' | 'independiente';

/**
 * Crear la cuenta. Al continuar se envía un código de 6 dígitos al correo y la cuenta no se
 * activa hasta escribirlo (spec, sección 6.7).
 */
export function Registro({ modo }: { modo: Modo }) {
  const router = useRouter();
  const conductor = modo === 'conductor';
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [celular, setCelular] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [vinculo, setVinculo] = useState<Vinculo>('empresa');
  const [invitacion, setInvitacion] = useState('');
  const [servicio, setServicio] = useState('');
  const [tocoCorreo, setTocoCorreo] = useState(false);

  const correoValido = esCorreoValido(correo);
  const listo =
    nombres.trim() !== '' &&
    apellidos.trim() !== '' &&
    esCelularValido(celular) &&
    correoValido &&
    clave.length >= LARGO_MINIMO_CLAVE &&
    (!conductor ||
      (vinculo === 'empresa' ? invitacion.trim().length >= 4 : servicio.trim() !== ''));

  const continuar = () =>
    router.push({
      pathname: conductor ? '/conductor/verificar' : '/acudiente/verificar',
      params: { correo: correo.trim().toLowerCase(), nombre: nombres.trim() },
    });

  return (
    <PantallaCuenta
      modo={modo}
      titulo={conductor ? 'Crea tu cuenta de conductor' : 'Crea tu cuenta'}
      subtitulo={
        conductor
          ? 'También sirve para acompañantes y administradores de ruta.'
          : 'Con ella inscribes a tus hijos y sigues su ruta en vivo.'
      }
      icono={
        <IconoCabecera>
          <IconoPersona tamano={28} color={colores.naranjaIcono} />
        </IconoCabecera>
      }
      pie={
        <Boton
          titulo="Crear cuenta"
          variante={conductor ? 'naranja' : 'marino'}
          deshabilitado={!listo}
          iconoDerecha={
            <IconoFlecha
              tamano={18}
              color={!listo ? colores.gris : conductor ? colores.marino : colores.blanco}
            />
          }
          onPress={continuar}
        />
      }
    >
      {conductor && (
        <View style={{ gap: 8 }}>
          <Texto peso={700} tamano={13}>
            ¿Cómo trabajas?
          </Texto>
          <View style={{ flexDirection: 'row', gap: 8 }} accessibilityRole="radiogroup">
            <OpcionVinculo
              titulo="Me invitó una empresa"
              activa={vinculo === 'empresa'}
              onPress={() => setVinculo('empresa')}
            />
            <OpcionVinculo
              titulo="Soy independiente"
              activa={vinculo === 'independiente'}
              onPress={() => setVinculo('independiente')}
            />
          </View>
          {vinculo === 'empresa' ? (
            <Campo
              etiqueta="Código de invitación"
              detalle="te lo da tu empresa"
              value={invitacion}
              onChangeText={(t) => setInvitacion(t.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={10}
              style={{ fontFamily: 'HankenGrotesk_800ExtraBold', fontSize: 20, letterSpacing: 4 }}
            />
          ) : (
            <Campo
              etiqueta="Nombre de tu servicio"
              detalle="lo ven los acudientes"
              value={servicio}
              onChangeText={setServicio}
              placeholder="Por ejemplo: Transportes Luis"
              autoCapitalize="words"
            />
          )}
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Campo
          etiqueta="Nombres"
          value={nombres}
          onChangeText={setNombres}
          autoCapitalize="words"
          autoComplete="given-name"
          estilo={{ flex: 1 }}
        />
        <Campo
          etiqueta="Apellidos"
          value={apellidos}
          onChangeText={setApellidos}
          autoCapitalize="words"
          autoComplete="family-name"
          estilo={{ flex: 1 }}
        />
      </View>
      <Campo
        etiqueta="Celular"
        detalle={conductor ? 'los acudientes te pueden llamar' : 'para que el conductor te llame'}
        value={celular}
        onChangeText={(t) => setCelular(t.replace(/\D/g, '').slice(0, 10))}
        keyboardType="phone-pad"
        autoComplete="tel"
        placeholder="300 000 0000"
      />
      <View style={{ gap: 4 }}>
        <Campo
          etiqueta="Correo"
          detalle="te enviaremos un código"
          value={correo}
          onChangeText={setCorreo}
          onBlur={() => setTocoCorreo(true)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          placeholder="tu@correo.com"
        />
        {tocoCorreo && correo !== '' && !correoValido && (
          <Texto tamano={13} color={colores.error}>
            Revisa el correo: debe verse como nombre@gmail.com.
          </Texto>
        )}
      </View>
      <View style={{ gap: 4 }}>
        <CampoClave
          etiqueta="Contraseña"
          value={clave}
          onChangeText={setClave}
          autoComplete="new-password"
        />
        <Texto
          tamano={13}
          color={clave.length >= LARGO_MINIMO_CLAVE ? colores.naranjaTexto : colores.gris}
        >
          {clave.length >= LARGO_MINIMO_CLAVE
            ? '✓ Contraseña lista'
            : `Mínimo ${LARGO_MINIMO_CLAVE} caracteres`}
        </Texto>
      </View>

      <Nota texto="Al crear la cuenta te llega un código de 6 dígitos al correo. Sin ese código la cuenta no se activa." />
    </PantallaCuenta>
  );
}

function OpcionVinculo({
  titulo,
  activa,
  onPress,
}: {
  titulo: string;
  activa: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: activa }}
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        minHeight: 52,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: radios.boton,
        justifyContent: 'center',
        backgroundColor: activa ? colores.marino : colores.blanco,
        borderWidth: activa ? 0 : 1.5,
        borderColor: colores.borde,
        transform: [{ scale: pressed ? 0.97 : 1 }],
      })}
    >
      <Texto peso={700} tamano={14} color={activa ? colores.blanco : colores.marino}>
        {titulo}
      </Texto>
    </Pressable>
  );
}
