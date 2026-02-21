import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e: any) {
      setError(e.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logo}>⬡</Text>
          <Text style={styles.title}>QR Forge</Text>
          <Text style={styles.subtitle}>ENCODE ANYTHING · SCAN EVERYWHERE</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>EMAIL</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>PASSWORD</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.buttonText}>Sign In →</Text>
            )}
          </Pressable>

          <Link href="/(auth)/register" asChild>
            <Pressable style={styles.linkRow}>
              <Text style={styles.linkText}>Don't have an account? </Text>
              <Text style={[styles.linkText, styles.linkHighlight]}>Sign up</Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, justifyContent: 'center', padding: Spacing.lg },
  header: { alignItems: 'center', marginBottom: Spacing.xxl },
  logo: { fontSize: 40, marginBottom: Spacing.sm },
  title: { fontSize: 34, fontStyle: 'italic', color: Colors.textPrimary, fontWeight: '700', marginBottom: Spacing.xs },
  subtitle: { fontSize: 10, letterSpacing: 2, color: Colors.textMuted },
  form: { gap: Spacing.md },
  field: { gap: Spacing.xs },
  label: { fontSize: 10, letterSpacing: 2, color: Colors.textSecondary, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 15,
  },
  error: { color: Colors.error, fontSize: 13 },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: Colors.white, fontSize: 15, fontWeight: '600', letterSpacing: 1 },
  linkRow: { flexDirection: 'row', justifyContent: 'center', paddingTop: Spacing.sm },
  linkText: { color: Colors.textSecondary, fontSize: 13 },
  linkHighlight: { color: Colors.primary },
});
