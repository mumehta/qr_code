import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';

export default function SettingsScreen() {
  const { user } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut(auth) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.card}>
          <Text style={styles.label}>SIGNED IN AS</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <Pressable style={styles.signOutBtn} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flex: 1, padding: Spacing.lg, gap: Spacing.lg },
  title: { ...Typography.heading },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: { fontSize: 10, letterSpacing: 2, color: Colors.textMuted, textTransform: 'uppercase' },
  email: { color: Colors.textPrimary, fontSize: 15 },
  signOutBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  signOutText: { color: Colors.error, fontWeight: '600', fontSize: 15 },
});
