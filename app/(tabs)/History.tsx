import { onAuthStateChanged, User } from 'firebase/auth';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    Timestamp,
    where,
} from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { auth, db } from '../../utils/firebase';

/* --------- Types locaux --------- */
interface HistoriqueItem {
  id: string;              // id du doc « postuler » ou « inscrire »
  type: 'etude' | 'event'; // pour distinguer les deux sources
  titre: string;           // titre récupéré dans la collection cible
  date: Timestamp | null;  // date de postulation / inscription
  statut: string;          // ex. « en attente », « inscrit »…
}

export default function History() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [items, setItems] = useState<HistoriqueItem[]>([]);
  const [loading, setLoading] = useState(true);

  /* --------- 1. Qui est connecté ? --------- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setFirebaseUser(user));
    return unsub;
  }, []);

  /* --------- 2. Lecture des deux collections --------- */
  const fetchHistorique = useCallback(async (user: User) => {
    try {
      /* -- Candidatures aux ÉTUDES -- */
      const postSnap = await getDocs(
        query(collection(db, 'postuler'), where('id_intervenant', '==', user.uid)),
      );

      const postItems: HistoriqueItem[] = await Promise.all(
        postSnap.docs.map(async (d) => {
          const cand = d.data();
          let titre = 'Étude inconnue';
          try {
            const etudeSnap = await getDoc(doc(db, 'etude', cand.id_etude));
            if (etudeSnap.exists()) titre = (etudeSnap.data() as any).titre;
          } catch (_) {}
          return {
            id: d.id,
            type: 'etude',
            titre,
            date: cand.date_postulation ?? null,
            statut: cand.statut ?? '',
          };
        }),
      );

      /* -- Inscriptions aux ÉVÉNEMENTS -- */
      const insSnap = await getDocs(
        query(collection(db, 'inscrire'), where('id_intervenant', '==', user.uid)),
      );

      const insItems: HistoriqueItem[] = await Promise.all(
        insSnap.docs.map(async (d) => {
          const insc = d.data();
          let titre = 'Événement inconnu';
          try {
            // ajuste « event » si ta collection s’appelle différemment
            const eventSnap = await getDoc(doc(db, 'event', insc.id_event));
            if (eventSnap.exists()) {
              const evData = eventSnap.data() as any;
              titre = evData.titre ?? evData.nom ?? titre;
            }
          } catch (_) {}
          return {
            id: d.id,
            type: 'event',
            titre,
            date: insc.date_inscription ?? null,
            statut: insc.statut ?? 'inscrit',
          };
        }),
      );

      /* -- Fusion + tri antéchronologique -- */
      const merged = [...postItems, ...insItems].sort((a, b) => {
        const aSec = a.date ? a.date.seconds : 0;
        const bSec = b.date ? b.date.seconds : 0;
        return bSec - aSec; // le plus récent d’abord
      });

      setItems(merged);
    } catch (err) {
      console.error('Erreur historique :', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /* --------- 3. Lance la requête quand l’utilisateur est prêt --------- */
  useEffect(() => {
    if (firebaseUser) fetchHistorique(firebaseUser);
    else setLoading(false);
  }, [firebaseUser, fetchHistorique]);

  /* --------- 4. Rendu d’un item --------- */
  const renderItem = ({ item }: { item: HistoriqueItem }) => {
    const dateStr =
      item.date ? new Date(item.date.seconds * 1000).toLocaleDateString() : '—';

    return (
      <View style={styles.itemContainer}>
        <Text style={styles.title}>
          {item.titre}
          {item.type === 'event' ? ' (événement)' : ''}
        </Text>
        <Text style={styles.meta}>
          {dateStr} • Statut : {item.statut}
        </Text>
      </View>
    );
  };

  /* --------- 5. États de chargement / vide --------- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007CB0" />
      </View>
    );
  }

  if (!items.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>
          Vous n’avez encore aucune candidature ou inscription.
        </Text>
      </View>
    );
  }

  /* --------- 6. Liste finale --------- */
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mon historique</Text>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

/* --------- Styles réutilisant ta charte --------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#007CB0',
  },
  itemContainer: {
    backgroundColor: '#007CB0',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    color: 'white',
    textAlign: 'center',
  },
  meta: {
    fontSize: 14,
    color: '#e0f4ff',
    textAlign: 'center',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
