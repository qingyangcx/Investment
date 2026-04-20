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

export function useGroups(userId) {
  const [groups, setGroups] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setGroups([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const q = query(
      collection(db, `users/${userId}/groups`),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoaded(true);
    });
    return unsub;
  }, [userId]);

  const addGroup = useCallback(
    (name) => {
      if (!userId) return null;
      const id = uid();
      const group = { id, name, createdAt: new Date().toISOString() };
      setDoc(doc(db, `users/${userId}/groups`, id), group);
      return group;
    },
    [userId]
  );

  const renameGroup = useCallback(
    (id, name) => {
      if (!userId) return;
      updateDoc(doc(db, `users/${userId}/groups`, id), { name });
    },
    [userId]
  );

  const deleteGroup = useCallback(
    (id) => {
      if (!userId) return;
      deleteDoc(doc(db, `users/${userId}/groups`, id));
    },
    [userId]
  );

  return { groups, addGroup, renameGroup, deleteGroup, loaded };
}
