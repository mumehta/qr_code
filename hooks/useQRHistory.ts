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

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<QRHistoryItem, 'id'>),
      }));
      setHistory(items);
      setLoading(false);
    });

    return unsubscribe;
  }, [uid]);

  const saveQR = useCallback(
    async (content: string, type: QRTab, label: string) => {
      if (!uid) return;
      await addDoc(collection(db, 'users', uid, 'qrHistory'), {
        content,
        type,
        label,
        createdAt: serverTimestamp(),
      });
    },
    [uid]
  );

  const deleteQR = useCallback(
    async (itemId: string) => {
      if (!uid) return;
      await deleteDoc(doc(db, 'users', uid, 'qrHistory', itemId));
    },
    [uid]
  );

  return { history, loading, saveQR, deleteQR };
}
