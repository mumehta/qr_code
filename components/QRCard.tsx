import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { QRHistoryItem } from '@/hooks/useQRHistory';
import { Colors, Radius, Spacing } from '@/constants/theme';

interface Props {
  item: QRHistoryItem;
  onDelete: () => void;
}

const TYPE_LABEL: Record<string, string> = {
  URL: '🔗 URL',
  Text: '✏️ Text',
  Contact: '👤 Contact',
};

export function QRCard({ item, onDelete }: Props) {
  const handleDelete = () => {
    Alert.alert('Delete QR', 'Remove this QR code from history?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.qrWrap}>
        <QRCode value={item.content} size={80} color="#000000" backgroundColor="#ffffff" />
      </View>
      <View style={styles.info}>
        <View style={styles.typeRow}>
          <Text style={styles.type}>{TYPE_LABEL[item.type] ?? item.type}</Text>
        </View>
        <Text style={styles.label} numberOfLines={1}>{item.label}</Text>
        <Text style={styles.content} numberOfLines={2}>{item.content}</Text>
      </View>
      <Pressable style={styles.deleteBtn} onPress={handleDelete} hitSlop={8}>
        <Text style={styles.deleteText}>✕</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
    alignItems: 'center',
  },
  qrWrap: {
    padding: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: Radius.sm,
  },
  info: { flex: 1, gap: 3 },
  typeRow: { flexDirection: 'row' },
  type: { fontSize: 10, color: Colors.primary, letterSpacing: 0.5 },
  label: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' },
  content: { color: Colors.textMuted, fontSize: 11, lineHeight: 16 },
  deleteBtn: { padding: Spacing.xs },
  deleteText: { color: Colors.textMuted, fontSize: 16 },
});
