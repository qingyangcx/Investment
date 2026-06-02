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

export function useStrategies(userId) {
  const [strategies, setStrategies] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setStrategies([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const q = query(
      collection(db, `users/${userId}/strategies`),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setStrategies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoaded(true);
    });
    return unsub;
  }, [userId]);

  const createStrategy = useCallback(
    ({ name }) => {
      if (!userId) return null;
      const id = uid();
      const now = new Date().toISOString();
      const strategy = {
        id,
        name: name?.trim() || "Untitled strategy",
        conditions: [],
        universe: [],
        createdAt: now,
        updatedAt: now,
      };
      setDoc(doc(db, `users/${userId}/strategies`, id), strategy);
      return strategy;
    },
    [userId]
  );

  const updateStrategy = useCallback(
    (id, patch) => {
      if (!userId) return;
      updateDoc(doc(db, `users/${userId}/strategies`, id), {
        ...patch,
        updatedAt: new Date().toISOString(),
      });
    },
    [userId]
  );

  const deleteStrategy = useCallback(
    (id) => {
      if (!userId) return;
      deleteDoc(doc(db, `users/${userId}/strategies`, id));
    },
    [userId]
  );

  return { strategies, createStrategy, updateStrategy, deleteStrategy, loaded };
}
