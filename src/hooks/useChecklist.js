import { useCallback, useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  setDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { uid } from "../utils/uid";

export function useChecklist(userId) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setItems([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const q = query(
      collection(db, `users/${userId}/checklist`),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoaded(true);
    });
    return unsub;
  }, [userId]);

  const addItem = useCallback(
    (text) => {
      if (!userId) return;
      const id = uid();
      setDoc(doc(db, `users/${userId}/checklist`, id), {
        id,
        text,
        done: false,
        createdAt: new Date().toISOString(),
      });
    },
    [userId]
  );

  const toggleItem = useCallback(
    (id) => {
      if (!userId) return;
      const item = items.find((i) => i.id === id);
      if (!item) return;
      updateDoc(doc(db, `users/${userId}/checklist`, id), { done: !item.done });
    },
    [userId, items]
  );

  const updateItem = useCallback(
    (id, text) => {
      if (!userId) return;
      updateDoc(doc(db, `users/${userId}/checklist`, id), { text });
    },
    [userId]
  );

  const deleteItem = useCallback(
    (id) => {
      if (!userId) return;
      deleteDoc(doc(db, `users/${userId}/checklist`, id));
    },
    [userId]
  );

  return { items, addItem, toggleItem, updateItem, deleteItem, loaded };
}
