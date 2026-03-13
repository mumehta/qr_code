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
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, getAuthErrorMessage } from '@/lib/firebase';
import { Colors, Radius, Spacing } from '@/constants/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    setError('');
    if (!email.trim()) { setError('Please enter your email address.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
    } catch (e) {
      setError(getAuthErrorMessage(e));
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
          <Text style={styles.subtitle}>RESET YOUR PASSWORD</Text>
        </View>

        <View style={styles.form}>
          {sent ? (
            <View style={styles.confirmationBox}>
              <Text style={styles.confirmationText}>
                Check your inbox — a reset link has been sent.
              </Text>
            </View>
          ) : (
            <>
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

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Pressable
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleReset}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.white} />
                ) : (
                  <Text style={styles.buttonText}>Send Reset Link →</Text>
                )}
              </Pressable>
            </>
          )}

          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.linkRow}>
              <Text style={styles.linkText}>Back to </Text>
              <Text style={[styles.linkText, styles.linkHighlight]}>Sign in</Text>
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
  confirmationBox: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.success,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  confirmationText: { color: Colors.success, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
