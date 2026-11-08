import { BotonIcono, Campo, colores, IconoOjo, type CampoProps } from '@enruta2/ui';
import { useState } from 'react';

/** Campo de contraseña con el botón para mostrarla u ocultarla. */
export function CampoClave(props: Omit<CampoProps, 'secureTextEntry' | 'derecha'>) {
  const [ver, setVer] = useState(false);
  return (
    <Campo
      autoComplete="password"
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!ver}
      derecha={
        <BotonIcono
          plano
          accessibilityLabel={ver ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          onPress={() => setVer((v) => !v)}
        >
          <IconoOjo tamano={20} color={colores.gris} />
        </BotonIcono>
      }
    />
  );
}
