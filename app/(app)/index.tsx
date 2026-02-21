import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useQRHistory } from '@/hooks/useQRHistory';
import { QRGenerator } from '@/components/QRGenerator';
import { Colors, Spacing } from '@/constants/theme';

export default function GenerateScreen() {
  const { user } = useAuth();
  const { saveQR } = useQRHistory(user?.uid);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>⬡</Text>
          <Text style={styles.title}>QR Forge</Text>
          <Text style={styles.subtitle}>ENCODE ANYTHING · SCAN EVERYWHERE</Text>
        </View>
        <QRGenerator onSave={saveQR} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  logo: { fontSize: 32, marginBottom: Spacing.xs },
  title: { fontSize: 28, fontStyle: 'italic', fontWeight: '700', color: Colors.textPrimary },
  subtitle: { fontSize: 9, letterSpacing: 2, color: Colors.textMuted, marginTop: Spacing.xs },
});
