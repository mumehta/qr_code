import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Colors, Radius, Spacing } from '@/constants/theme';
import {
  ContactData,
  QRTab,
  getContent,
  getLabel,
  isValid,
} from '@/lib/qr';

const TABS: QRTab[] = ['URL', 'Text', 'Contact'];

interface Props {
  onSave?: (content: string, type: QRTab, label: string) => Promise<void>;
}

export function QRGenerator({ onSave }: Props) {
  const [tab, setTab] = useState<QRTab>('URL');
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [contact, setContact] = useState<ContactData>({ name: '', org: '', phone: '', email: '' });
  const [qrContent, setQrContent] = useState('');
  const [saving, setSaving] = useState(false);
  const svgRef = useRef<any>(null);

  const inputData = tab === 'URL'
    ? { tab: 'URL' as const, url }
    : tab === 'Text'
    ? { tab: 'Text' as const, text }
    : { tab: 'Contact' as const, contact };

  const content = getContent(inputData);
  const valid = isValid(inputData);

  const handleGenerate = () => {
    if (!valid) return;
    setQrContent(content);
  };

  const handleDownload = async () => {
    if (!svgRef.current) return;
    if (Platform.OS === 'web') {
      try {
        svgRef.current.toDataURL((dataUrl: string) => {
          try {
            if (!dataUrl) throw new Error('Empty image data.');
            const link = document.createElement('a');
            link.href = 'data:image/png;base64,' + dataUrl;
            link.download = 'qrcode.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch {
            Alert.alert('Error', 'Failed to download QR code. Please try again.');
          }
        });
      } catch {
        Alert.alert('Error', 'Failed to download QR code. Please try again.');
      }
      return;
    }
    const { status } = await MediaLibrary.requestPermissionsAsync(false, ['photo']);
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to save QR codes to your photo library.');
      return;
    }
    svgRef.current.toDataURL(async (dataUrl: string) => {
      try {
        if (!FileSystem.cacheDirectory) throw new Error('Cache directory unavailable.');
        const fileUri = FileSystem.cacheDirectory + 'qrcode.png';
        await FileSystem.writeAsStringAsync(fileUri, dataUrl, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await MediaLibrary.saveToLibraryAsync(fileUri);
        Alert.alert('Saved', 'QR code saved to your photo library.');
      } catch {
        Alert.alert('Error', 'Failed to save QR code. Please try again.');
      }
    });
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(qrContent);
      Alert.alert('Copied', 'QR content copied to clipboard.');
    } catch {
      Alert.alert('Error', 'Failed to copy to clipboard. Please try again.');
    }
  };

  const handleSave = async () => {
    if (!onSave || !qrContent) return;
    setSaving(true);
    try {
      await onSave(qrContent, tab, getLabel(inputData));
      Alert.alert('Saved', 'QR code added to your history.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save. Please try again.';
      Alert.alert('Error', message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((t) => (
          <Pressable
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => { setTab(t); setQrContent(''); }}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'URL' ? '🔗 URL' : t === 'Text' ? '✏️ Text' : '👤 Contact'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Inputs */}
      {tab === 'URL' && (
        <View style={styles.field}>
          <Text style={styles.label}>WEBSITE URL</Text>
          <TextInput
            style={styles.input}
            placeholder="example.com or https://..."
            placeholderTextColor={Colors.textMuted}
            value={url}
            onChangeText={(v) => { setUrl(v); setQrContent(''); }}
            autoCapitalize="none"
            keyboardType="url"
          />
          <Text style={styles.hint}>https:// is added automatically if omitted</Text>
        </View>
      )}

      {tab === 'Text' && (
        <View style={styles.field}>
          <Text style={styles.label}>PLAIN TEXT</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Type any text or message..."
            placeholderTextColor={Colors.textMuted}
            value={text}
            onChangeText={(v) => { setText(v); setQrContent(''); }}
            multiline
          />
        </View>
      )}

      {tab === 'Contact' && (
        <View style={styles.grid}>
          {([
            { key: 'name', label: 'FULL NAME', placeholder: 'Jane Smith' },
            { key: 'org', label: 'ORGANIZATION', placeholder: 'Acme Corp' },
            { key: 'phone', label: 'PHONE', placeholder: '+1 555 000 0000' },
            { key: 'email', label: 'EMAIL', placeholder: 'jane@example.com' },
          ] as const).map(({ key, label, placeholder }) => (
            <View key={key} style={styles.gridItem}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
                value={contact[key]}
                onChangeText={(v) => setContact((c) => ({ ...c, [key]: v }))}
              />
            </View>
          ))}
        </View>
      )}

      {/* Generate button */}
      <Pressable
        style={[styles.genBtn, !valid && styles.genBtnDisabled]}
        onPress={handleGenerate}
        disabled={!valid}
      >
        <Text style={styles.genBtnText}>Generate QR Code →</Text>
      </Pressable>

      {/* QR display */}
      {qrContent ? (
        <View style={styles.qrSection}>
          <View style={styles.qrFrame}>
            <QRCode
              value={qrContent}
              size={220}
              color="#000000"
              backgroundColor="#ffffff"
              getRef={(ref) => { svgRef.current = ref; }}
            />
          </View>

          <View style={styles.actions}>
            <Pressable style={styles.actionBtn} onPress={handleDownload}>
              <Text style={styles.actionText}>⬇ Save PNG</Text>
            </Pressable>
            <Pressable style={styles.actionBtn} onPress={handleCopy}>
              <Text style={styles.actionText}>⎘ Copy</Text>
            </Pressable>
            {onSave && (
              <Pressable style={[styles.actionBtn, styles.saveBtn]} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={Colors.success} size="small" />
                ) : (
                  <Text style={[styles.actionText, styles.saveText]}>★ Save</Text>
                )}
              </Pressable>
            )}
          </View>

          <View style={styles.preview}>
            <Text style={styles.previewLabel}>ENCODED CONTENT</Text>
            <Text style={styles.previewValue} numberOfLines={3}>
              {qrContent}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },
  tabs: {
    flexDirection: 'row',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { color: Colors.textMuted, fontSize: 12, letterSpacing: 0.5 },
  tabTextActive: { color: Colors.white, fontWeight: '600' },
  field: { gap: Spacing.xs },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  gridItem: { width: '47%', gap: Spacing.xs },
  label: { fontSize: 10, letterSpacing: 2, color: Colors.textSecondary, textTransform: 'uppercase' },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontSize: 14,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  hint: { color: Colors.textMuted, fontSize: 10 },
  genBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
  },
  genBtnDisabled: { opacity: 0.4 },
  genBtnText: { color: Colors.white, fontSize: 14, fontWeight: '600', letterSpacing: 1 },
  qrSection: { alignItems: 'center', gap: Spacing.md },
  qrFrame: {
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Radius.lg,
  },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: {
    flex: 1,
    padding: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  saveBtn: { borderColor: Colors.success },
  actionText: { color: Colors.textSecondary, fontSize: 12, letterSpacing: 0.5 },
  saveText: { color: Colors.success },
  preview: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  previewLabel: { fontSize: 9, letterSpacing: 2, color: Colors.textMuted, textTransform: 'uppercase' },
  previewValue: { color: Colors.textSecondary, fontSize: 11, lineHeight: 18 },
});
