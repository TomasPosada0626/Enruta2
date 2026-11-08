import {
  Boton,
  CampoCodigo,
  colores,
  IconoCheck,
  IconoInfo,
  IconoSobre,
  Nota,
  Texto,
} from '@enruta2/ui';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { IconoCabecera, PantallaCuenta, type Modo } from './PantallaCuenta';
import {
  CODIGO_CORREO_DE_PRUEBA,
  DIGITOS_CODIGO,
  INTENTOS_CODIGO,
  MINUTOS_DE_VIGENCIA,
  SEGUNDOS_PARA_REENVIAR,
  textoIntentos,
  textoSegundos,
} from './reglas';

export type Proposito = 'verificar' | 'recuperar';

type Estado = 'escribiendo' | 'verificando' | 'listo';

/**
 * Escribir el código de 6 dígitos que llegó al correo (spec, sección 6.7). En el prototipo el
 * código correcto es 123456; con la API, la verificación y los reenvíos los decide el servidor.
 */
export function VerificarCorreo({
  modo,
  proposito,
  correo,
  onVerificado,
}: {
  modo: Modo;
  proposito: Proposito;
  correo: string;
  onVerificado: () => void;
}) {
  const router = useRouter();
  const conductor = modo === 'conductor';
  const [codigo, setCodigo] = useState('');
  const [estado, setEstado] = useState<Estado>('escribiendo');
  const [intentos, setIntentos] = useState(INTENTOS_CODIGO);
  const [error, setError] = useState<string | null>(null);
  const [espera, setEspera] = useState(SEGUNDOS_PARA_REENVIAR);
  const [reenviado, setReenviado] = useState(false);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const sinIntentos = intentos <= 0;

  const verificar = (valor: string) => {
    if (estado !== 'escribiendo' || sinIntentos || valor.length !== DIGITOS_CODIGO) return;
    setEstado('verificando');
    setTimeout(() => {
      if (valor === CODIGO_CORREO_DE_PRUEBA) {
        setEstado('listo');
        setTimeout(onVerificado, 700);
        return;
      }
      const quedan = intentos - 1;
      setIntentos(quedan);
      setCodigo('');
      setEstado('escribiendo');
      setError(
        quedan > 0
          ? `Ese código no es. ${textoIntentos(quedan)}.`
          : 'Se acabaron los intentos con este código. Pide uno nuevo.',
      );
    }, 650);
  };

  const reenviar = () => {
    setEspera(SEGUNDOS_PARA_REENVIAR);
    setIntentos(INTENTOS_CODIGO);
    setCodigo('');
    setError(null);
    setReenviado(true);
  };

  const recuperar = proposito === 'recuperar';
  const listo = estado === 'listo';
  const tituloBoton =
    estado === 'verificando'
      ? 'Verificando…'
      : listo
        ? recuperar
          ? 'Código correcto'
          : 'Correo confirmado'
        : 'Confirmar';

  return (
    <PantallaCuenta
      modo={modo}
      titulo={recuperar ? 'Escribe el código' : 'Revisa tu correo'}
      subtitulo={
        <>
          Te enviamos un código de {DIGITOS_CODIGO} dígitos a{' '}
          <Texto peso={800} tamano={15} color={conductor ? colores.blanco : colores.marino}>
            {correo}
          </Texto>
        </>
      }
      icono={
        <IconoCabecera>
          <IconoSobre tamano={30} color={colores.naranjaIcono} />
        </IconoCabecera>
      }
      pie={
        <Boton
          titulo={tituloBoton}
          variante={conductor ? 'naranja' : 'marino'}
          deshabilitado={
            codigo.length !== DIGITOS_CODIGO || sinIntentos || estado === 'verificando'
          }
          icono={
            listo ? (
              <IconoCheck tamano={18} color={conductor ? colores.marino : colores.blanco} />
            ) : undefined
          }
          onPress={() => verificar(codigo)}
        />
      }
    >
      <View style={{ gap: 10 }}>
        <CampoCodigo
          valor={codigo}
          onCambiar={(v) => {
            setCodigo(v);
            if (error) setError(null);
          }}
          onCompleto={verificar}
          error={error !== null}
          deshabilitado={sinIntentos || estado !== 'escribiendo'}
        />
        <Texto
          tamano={14}
          color={error ? colores.error : colores.gris}
          peso={error ? 700 : 400}
          accessibilityLiveRegion="polite"
        >
          {error ?? `El código vence en ${MINUTOS_DE_VIGENCIA} minutos.`}
        </Texto>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
        <Texto tamano={14} color={colores.gris}>
          ¿No te llegó?
        </Texto>
        {espera > 0 ? (
          <Texto tamano={14} peso={700} color={colores.gris}>
            Pide otro en {textoSegundos(espera)}
          </Texto>
        ) : (
          <Boton
            titulo="Enviar un código nuevo"
            variante="texto"
            alto={36}
            tamanoTexto={14}
            estilo={{ paddingHorizontal: 0 }}
            onPress={reenviar}
          />
        )}
      </View>

      {reenviado && (
        <Nota
          fondo={colores.naranjaAviso}
          icono={<IconoSobre tamano={18} color={colores.naranjaIcono} />}
          texto="Te enviamos un código nuevo. El anterior ya no sirve."
        />
      )}

      <Nota texto="Si no lo ves, búscalo en Spam o en Promociones. Llega de Enruta2." />

      <Boton
        titulo="Cambiar el correo"
        variante="texto"
        alto={40}
        tamanoTexto={14}
        estilo={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
        onPress={() => router.back()}
      />

      <Nota
        fondo={colores.marinoSuave}
        icono={<IconoInfo tamano={18} color={colores.marino} />}
        texto={`Solo en el prototipo: el código es ${CODIGO_CORREO_DE_PRUEBA}.`}
      />
    </PantallaCuenta>
  );
}
