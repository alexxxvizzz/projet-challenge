import { useLocalSearchParams } from 'expo-router';
import { Timestamp, collection, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { db } from '../../utils/firebase';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

interface Candidature {
  id: string;             // id du doc postuler
  userId: string;         // id_intervenant
  status: string;
  date: Timestamp | null;
  user?: UserProfile;
}

export default function PostulStudies() {
  /* ---- 1. récupère l’ID d’étude depuis l’URL ---- */
  const { idEtude } = useLocalSearchParams<{ idEtude: string }>();

  /* ---- 2. état local ---- */
  const [candidats, setCandidats] = useState<Candidature[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Candidature | null>(null);

  /* ---- 3. fetch candidatures + users ---- */
  const fetchData = useCallback(async () => {
    if (!idEtude) return;

    try {
      const snap = await getDocs(
        query(collection(db, 'postuler'), where('id_etude', '==', idEtude)),
      );

      const list: Candidature[] = await Promise.all(
        snap.docs.map(async (d) => {
          const cand = d.data();
          let user: UserProfile | undefined;
          try {
            const userSnap = await getDoc(doc(db, 'users', cand.id_intervenant));
            if (userSnap.exists()) user = userSnap.data() as UserProfile;
          } catch (_) {}
          return {
            id: d.id,
            userId: cand.id_intervenant,
            status: cand.statut,
            date: cand.date_postulation ?? null,
            user,
          };
        }),
      );

      setCandidats(list);
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de charger les candidatures.');
    } finally {
      setLoading(false);
    }
  }, [idEtude]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- 4. Actions accepter / refuser ---- */
  const updateStatus = async (cand: Candidature, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'postuler', cand.id), { statut: newStatus });
      setCandidats((prev) =>
        prev.map((c) => (c.id === cand.id ? { ...c, status: newStatus } : c)),
      );
      setSelected(null);
    } catch (e) {
      Alert.alert('Erreur', "La mise à jour n'a pas réussi.");
    }
  };

  /* ---- 5. Rendu d’un item ---- */
  const renderItem = ({ item }: { item: Candidature }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => setSelected(item)}
      activeOpacity={0.8}
    >
      <Text style={styles.cardName}>
        {item.user?.firstName || ''} {item.user?.lastName || ''}
      </Text>
      <Text style={styles.cardStatus}>Statut : {item.status}</Text>
    </TouchableOpacity>
  );

  /* ---- 6. Écrans de chargement / vide ---- */
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007CB0" />
      </View>
    );
  }

  if (!candidats.length) {
    return (
      <View style={styles.center}>
        <Text>Aucun candidat pour cette étude.</Text>
      </View>
    );
  }

  /* ---- 7. Écran principal ---- */
  return (
    <View style={styles.container}>

      <FlatList
        data={candidats}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* ---- 8. Modal détail ---- */}
      <Modal
        visible={!!selected}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selected && (
              <>
                <Text style={styles.modalTitle}>
                  {selected.user?.firstName} {selected.user?.lastName}
                </Text>

                <Text style={styles.modalText}>
                  Email : {selected.user?.email || '—'}
                </Text>
                <Text style={styles.modalText}>
                  Téléphone : {selected.user?.phone || '—'}
                </Text>
                <Text style={styles.modalText}>
                  Statut actuel : {selected.status}
                </Text>
                <Text style={styles.modalText}>
                  Date de candidature :{' '}
                  {selected.date
                    ? new Date(selected.date.seconds * 1000).toLocaleDateString()
                    : '—'}
                </Text>

                <View style={styles.modalButtons}>
                  <Pressable
                    style={styles.refuseButton}
                    onPress={() => updateStatus(selected, 'refusé')}
                  >
                    <Text style={styles.refuseText}>Refuser</Text>
                  </Pressable>
                  <Pressable
                    style={styles.acceptButton}
                    onPress={() => updateStatus(selected, 'accepté')}
                  >
                    <Text style={styles.acceptText}>Accepter</Text>
                  </Pressable>
                  <Pressable
                    style={styles.closeButton}
                    onPress={() => setSelected(null)}
                  >
                    <Text style={styles.closeText}>Fermer</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---- Styles ---- */
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
    color: '#007CB0',
    textAlign: 'center',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#007CB0',
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardName: { color: '#fff', fontSize: 18, fontWeight: '700' },
  cardStatus: { color: '#e0f4ff', marginTop: 4 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  /* ---- Modal ---- */
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '90%',
    borderRadius: 18,
    padding: 20,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  modalText: { fontSize: 16, marginBottom: 10, textAlign: 'center' },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  refuseButton: {
    backgroundColor: '#c62828',
    padding: 12,
    borderRadius: 10,
    margin: 4,
  },
  acceptButton: {
    backgroundColor: '#2e7d32',
    padding: 12,
    borderRadius: 10,
    margin: 4,
  },
  closeButton: {
    backgroundColor: '#aaa',
    padding: 12,
    borderRadius: 10,
    margin: 4,
  },
  refuseText: { color: '#fff', fontWeight: '700' },
  acceptText: { color: '#fff', fontWeight: '700' },
  closeText: { color: '#fff', fontWeight: '700' },
});
