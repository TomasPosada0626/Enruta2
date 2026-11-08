import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Animated, Pressable, TextInput, View } from 'react-native';

import { Texto } from './Texto';
import { colores, radios } from './tema';

export type CampoCodigoProps = {
  valor: string;
  onCambiar: (valor: string) => void;
  /** Se llama cuando se completan las cifras (escritas o pegadas). */
  onCompleto?: (valor: string) => void;
  digitos?: number;
  /** Marca las casillas en rojo y las sacude una vez. */
  error?: boolean;
  deshabilitado?: boolean;
  /** Fondo azul marino (modo conductor). */
  sobreOscuro?: boolean;
  autoFocus?: boolean;
  accessibilityLabel?: string;
};

/**
 * Casillas para el código que llega por correo. Un solo TextInput invisible recibe lo que se
 * escribe o se pega ("482 913" también sirve) y las casillas solo lo muestran.
 */
export function CampoCodigo({
  valor,
  onCambiar,
  onCompleto,
  digitos = 6,
  error = false,
  deshabilitado = false,
  sobreOscuro = false,
  autoFocus = true,
  accessibilityLabel = `Código de ${digitos} dígitos`,
}: CampoCodigoProps) {
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const [enfocado, setEnfocado] = useState(false);
  const [sacudida] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!error) return;
    sacudida.setValue(0);
    Animated.sequence(
      [10, -10, 7, -7, 3, 0].map((toValue) =>
        Animated.timing(sacudida, { toValue, duration: 55, useNativeDriver: true }),
      ),
    ).start();
  }, [error, sacudida]);

  const cambiar = (texto: string) => {
    const limpio = texto.replace(/\D/g, '').slice(0, digitos);
    onCambiar(limpio);
    if (limpio.length === digitos) onCompleto?.(limpio);
  };

  const mitad = Math.ceil(digitos / 2);
  const activa = Math.min(valor.length, digitos - 1);

  return (
    <Pressable
      onPress={() => input.current?.focus()}
      accessibilityRole="none"
      disabled={deshabilitado}
    >
      <Animated.View
        style={{ flexDirection: 'row', gap: 8, transform: [{ translateX: sacudida }] }}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
      >
        {Array.from({ length: digitos }, (_, i) => {
          const cifra = valor[i];
          const esActiva = enfocado && !deshabilitado && i === activa && valor.length < digitos;
          const borde = error
            ? colores.error
            : esActiva
              ? colores.naranja
              : cifra
                ? colores.marino
                : colores.borde;
          return (
            <View
              key={i}
              style={{
                flex: 1,
                height: 64,
                marginLeft: i === mitad ? 10 : 0,
                borderRadius: radios.boton,
                borderWidth: esActiva || error || cifra ? 2 : 1.5,
                borderColor: borde,
                backgroundColor: error
                  ? colores.errorSuave
                  : sobreOscuro && !cifra
                    ? colores.superficie
                    : colores.blanco,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: deshabilitado ? 0.5 : 1,
              }}
            >
              {cifra ? (
                <Texto peso={800} tamano={30} color={error ? colores.error : colores.marino}>
                  {cifra}
                </Texto>
              ) : esActiva ? (
                <View
                  style={{
                    width: 2,
                    height: 28,
                    borderRadius: 1,
                    backgroundColor: colores.naranja,
                  }}
                />
              ) : null}
            </View>
          );
        })}
      </Animated.View>
      <TextInput
        ref={input}
        value={valor}
        onChangeText={cambiar}
        onFocus={() => setEnfocado(true)}
        onBlur={() => setEnfocado(false)}
        editable={!deshabilitado}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        // El límite se aplica en `cambiar`: así un código pegado con espacios no se corta.
        maxLength={digitos * 2}
        caretHidden
        contextMenuHidden={false}
        accessibilityLabel={accessibilityLabel}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          color: 'transparent',
          backgroundColor: 'transparent',
          fontSize: 1,
        }}
      />
    </Pressable>
  );
}
