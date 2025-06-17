// src/hooks/useUserRole.ts
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from '../utils/firebase';

export default function useUserRole() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return setIsAdmin(false);
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        setIsAdmin(snap.exists() ? !!snap.data()?.isAdmin : false);
      } catch {
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  return isAdmin;           // null = en cours de chargement
}
