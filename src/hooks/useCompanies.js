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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { uid } from "../utils/uid";

const EMPTY_COMPANY = {
  ticker: "",
  name: "",
  sector: "Technology",
  moats: [],
  managementNotes: "",
  risks: "",
  generalNotes: "",
  valuation: {
    method: "dcf",
    discountRate: 10,
    growthRate: 8,
    terminalGrowth: 3,
    currentFCF: 0,
    yearsProjected: 10,
    intrinsicValue: null,
  },
  targets: {
    intrinsicValue: 0,
    marginOfSafety: 30,
    buyPrice: 0,
    sellPrice: 0,
    currentPrice: 0,
  },
  reasonablePrice: null,
  groupIds: [],
  buyPlan: { totalBudget: null, currency: "USD", rows: [] },
  actualBuys: [],
  actualCurrency: "USD",
};

export function useCompanies(userId) {
  const [companies, setCompanies] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!userId) {
      setCompanies([]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    const q = query(
      collection(db, `users/${userId}/companies`),
      orderBy("order", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setCompanies(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoaded(true);
    });
    return unsub;
  }, [userId]);

  const colRef = useCallback(
    () => collection(db, `users/${userId}/companies`),
    [userId]
  );

  const addCompany = useCallback(
    (data) => {
      if (!userId) return null;
      const id = uid();
      const now = new Date().toISOString();
      const company = {
        ...EMPTY_COMPANY,
        ...data,
        id,
        order: Date.now(),
        createdAt: now,
        updatedAt: now,
      };
      setDoc(doc(db, `users/${userId}/companies`, id), company);
      return company;
    },
    [userId]
  );

  const updateCompany = useCallback(
    (id, updates) => {
      if (!userId) return;
      updateDoc(doc(db, `users/${userId}/companies`, id), {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
    },
    [userId]
  );

  const deleteCompany = useCallback(
    (id) => {
      if (!userId) return;
      deleteDoc(doc(db, `users/${userId}/companies`, id));
    },
    [userId]
  );

  const getCompany = useCallback(
    (id) => companies.find((c) => c.id === id),
    [companies]
  );

  const reorderCompanies = useCallback(
    (fromId, toId) => {
      if (!userId || fromId === toId) return;
      const fromIdx = companies.findIndex((c) => c.id === fromId);
      const toIdx = companies.findIndex((c) => c.id === toId);
      if (fromIdx < 0 || toIdx < 0) return;

      // companies are sorted by order desc (highest order = top)
      // compute a new order value for the moved item
      let newOrder;
      if (toIdx === 0) {
        newOrder = (companies[0].order ?? Date.now()) + 1000;
      } else if (toIdx === companies.length - 1) {
        newOrder = (companies[companies.length - 1].order ?? Date.now()) - 1000;
      } else {
        // insert between toIdx and its neighbor (on the side away from fromIdx)
        const neighborIdx = fromIdx < toIdx ? toIdx + 1 : toIdx - 1;
        const a = companies[toIdx].order ?? 0;
        const b = companies[neighborIdx]?.order ?? a - 1000;
        newOrder = (a + b) / 2;
      }
      updateDoc(doc(db, `users/${userId}/companies`, fromId), { order: newOrder });
    },
    [userId, companies]
  );

  return { companies, addCompany, updateCompany, deleteCompany, getCompany, reorderCompanies, loaded };
}
