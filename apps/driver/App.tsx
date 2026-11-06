import { DRIVER_APP_ROLES, ROLE_LABELS } from '@enruta2/domain';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

const audience = DRIVER_APP_ROLES.map((role) => ROLE_LABELS[role]).join(' · ');

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enruta2 Conductor</Text>
      <Text style={styles.audience}>{audience}</Text>
      <Text style={styles.note}>Aquí vas a ver la ruta del día y el orden de las paradas.</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  title: { fontSize: 28, fontWeight: '700', color: '#0F172A' },
  audience: { fontSize: 16, color: '#1D4ED8' },
  note: { fontSize: 14, color: '#475569', textAlign: 'center' },
});
