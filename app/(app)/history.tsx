import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { useQRHistory } from '@/hooks/useQRHistory';
import { QRCard } from '@/components/QRCard';
import { Colors, Spacing, Typography } from '@/constants/theme';

export default function HistoryScreen() {
  const { user } = useAuth();
  const { history, loading, error, deleteQR } = useQRHistory(user?.uid);

  const handleDelete = async (id: string) => {
    try {
      await deleteQR(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete. Please try again.';
      Alert.alert('Error', message);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.empty}>Something went wrong.</Text>
          <Text style={styles.emptySub}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <Text style={styles.count}>{history.length} saved</Text>
      </View>
      {history.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.empty}>No QR codes saved yet.</Text>
          <Text style={styles.emptySub}>Generate one and tap Save.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <QRCard item={item} onDelete={() => handleDelete(item.id)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: { ...Typography.heading },
  count: { color: Colors.textMuted, fontSize: 13 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.xs },
  empty: { color: Colors.textSecondary, fontSize: 16 },
  emptySub: { color: Colors.textMuted, fontSize: 13 },
  list: { padding: Spacing.lg, gap: Spacing.md },
});
