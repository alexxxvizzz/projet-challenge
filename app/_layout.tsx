// app/_layout.tsx  (proposition complète)
import { Slot, useRouter, useSegments } from 'expo-router';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { app } from '../utils/firebase'; // init Firebase

export default function RootLayout() {
  // 1.  Suivre l'auth Firebase
  const [user, setUser]   = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(getAuth(app), u => {
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, []);

  // 2.  Garde d’auth basée sur le router
  const segments = useSegments();          // tableau du chemin courant
  const router   = useRouter();

  useEffect(() => {
    if (loading) return;                   // attendre Firebase

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');     // non loggé → zone auth
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/articles');  // loggé → zone privée
    }
  }, [user, loading, segments, router]);

  // 3.  Écran de chargement si besoin
  if (loading) return null;  // splash / spinner custom

  // 4.  Afficher l’arbre normal
  return <Slot />;           // remplace le <Stack /> d'origine
}
