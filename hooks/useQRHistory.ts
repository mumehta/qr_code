import { useCallback, useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { QRTab } from '@/lib/qr';

export interface QRHistoryItem {
  id: string;
  content: string;
  type: QRTab;
  label: string;
  createdAt: Timestamp;
}

export function useQRHistory(uid: string | undefined) {
  const [history, setHistory] = useState<QRHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) {
      setHistory([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'users', uid, 'qrHistory'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<QRHistoryItem, 'id'>),
        }));
        setHistory(items);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore snapshot error:', err);
        setError('Failed to load QR history. Check your connection and try again.');
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [uid]);

  const saveQR = useCallback(
    async (content: string, type: QRTab, label: string) => {
      if (!uid) return;
      try {
        await addDoc(collection(db, 'users', uid, 'qrHistory'), {
          content,
          type,
          label,
          createdAt: serverTimestamp(),
        });
      } catch (err) {
        console.error('Failed to save QR:', err);
        throw new Error('Failed to save QR code. Please try again.');
      }
    },
    [uid]
  );

  const deleteQR = useCallback(
    async (itemId: string) => {
      if (!uid) return;
      try {
        await deleteDoc(doc(db, 'users', uid, 'qrHistory', itemId));
      } catch (err) {
        console.error('Failed to delete QR:', err);
        throw new Error('Failed to delete QR code. Please try again.');
      }
    },
    [uid]
  );

  return { history, loading, error, saveQR, deleteQR };
}
