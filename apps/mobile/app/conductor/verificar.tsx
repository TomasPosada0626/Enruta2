import { useLocalSearchParams, useRouter } from 'expo-router';

import { VerificarCorreo, type Proposito } from '../../src/cuenta/VerificarCorreo';

/** Código de 6 dígitos del correo. Al confirmar el correo entra a las rutas de hoy; al recuperar, pide la contraseña nueva. */
export default function PantallaVerificar() {
  const router = useRouter();
  const { correo = '', proposito = 'verificar' } = useLocalSearchParams<{
    correo?: string;
    proposito?: Proposito;
  }>();

  return (
    <VerificarCorreo
      modo="conductor"
      proposito={proposito}
      correo={correo}
      onVerificado={() => {
        if (proposito === 'recuperar') {
          router.replace({ pathname: '/conductor/nueva-clave', params: { correo } });
          return;
        }
        if (router.canDismiss()) router.dismissAll();
        router.replace('/conductor/hoy');
      }}
    />
  );
}
