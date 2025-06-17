/* ───── events.tsx – version “look 2” + filtre catégorie ───── */

import { Picker } from '@react-native-picker/picker'; // ← NEW
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { onAuthStateChanged, User } from 'firebase/auth';
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';

import { auth, db } from '../../utils/firebase';

/* ---------- Types ---------- */
interface Evenement {
  id: string;
  capacite: number;
  date_evenement: any;
  date_publication_evenement: any;
  description: string;
  id_entreprise: string;
  lieu: string;
  titre: string;
  categorie: string;                // ← NEW
}

/* ---------- Helpers ---------- */
const notify = (title: string, message: string, onOk?: () => void) =>
  Platform.OS === 'web'
    ? (window.alert(`${title}\n\n${message}`), onOk?.())
    : Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);

/* ---------- Composant ---------- */
export default function Event() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  /* ----- filtre catégorie ----- */
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  /* -------- Auth -------- */
  useEffect(() => onAuthStateChanged(auth, (u) => setFirebaseUser(u)), []);

  /* -------- Fetch events -------- */
  useEffect(() => {
    getDocs(collection(db, 'evenement')).then((snap) =>
      setEvents(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Evenement[])
    );
  }, []);

  /* -------- catégories distinctes -------- */
  const categories = useMemo(
    () => Array.from(new Set(events.map((e) => e.categorie))).filter(Boolean),
    [events]
  );

  /* -------- liste filtrée -------- */
  const visible =
    selectedCat === 'ALL' ? events : events.filter((e) => e.categorie === selectedCat);

  /* -------- Inscription -------- */
  const handleApply = async () => {
    if (!selectedEvent || !firebaseUser) return;

    const dupQuery = query(
      collection(db, 'inscrire'),
      where('id_evenement', '==', selectedEvent.id),
      where('id_intervenant', '==', firebaseUser.uid)
    );
    const dupSnap = await getDocs(dupQuery);
    if (!dupSnap.empty) {
      notify('Déjà inscrit', 'Vous êtes déjà inscrit à cet événement.');
      return;
    }

    try {
      await addDoc(collection(db, 'inscrire'), {
        date_inscription: serverTimestamp(),
        id_evenement: selectedEvent.id,
        id_intervenant: firebaseUser.uid,
        statut: 'en attente',
      });
      notify('Inscription envoyée', 'Votre inscription est enregistrée.', () => setModalVisible(false));
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', "Une erreur s'est produite lors de l'inscription.");
    }
  };

  /* -------- UI handlers -------- */
  const openModal = (evt: Evenement) => {
    setSelectedEvent(evt);
    setModalVisible(true);
  };
  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  /* -------- Render item -------- */
  const renderItem = ({ item }: { item: Evenement }) => (
    <TouchableOpacity onPress={() => openModal(item)} activeOpacity={0.9}>
      <View style={styles.eventCard}>
        <Text style={styles.eventTitle}>{item.titre}</Text>

        <View style={styles.eventDetailRow}>
          <Text style={styles.eventLabel}>📅</Text>
          <Text style={styles.eventText}>
            {new Date(item.date_evenement.seconds * 1000).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.eventDetailRow}>
          <Text style={styles.eventLabel}>📍</Text>
          <Text style={styles.eventText}>{item.lieu}</Text>
        </View>

        <View style={styles.eventDetailRow}>
          <Text style={styles.eventLabel}>👥</Text>
          <Text style={styles.eventText}>Capacité : {item.capacite}</Text>
        </View>

        <View style={styles.eventDetailRow}>
          <Text style={styles.eventLabel}>🏷️</Text>
          <Text style={styles.eventText}>{item.categorie}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  /* -------- JSX -------- */
  return (
    <View style={styles.container}>
      {/* -------- Filtre catégorie -------- */}
      <View style={styles.filterBox}>
        <Text style={styles.filterLabel}>Catégorie :</Text>
        <Picker
          selectedValue={selectedCat}
          onValueChange={(value: string) => setSelectedCat(value)}
          style={styles.picker}
        >
          <Picker.Item label="Toutes" value="ALL" />
          {categories.map((c) => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
      </View>

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      {/* ---------- Modal ---------- */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={closeModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedEvent && (
              <>
                <Text style={styles.modalTitle}>{selectedEvent.titre}</Text>
                <Text style={styles.modalText}>📝Description : {selectedEvent.description}</Text>
                <Text style={styles.modalText}>
                  📅Date : {new Date(selectedEvent.date_evenement.seconds * 1000).toLocaleString()}
                </Text>
                <Text style={styles.modalText}>📍Lieu : {selectedEvent.lieu}</Text>
                <Text style={styles.modalText}>👥Capacité : {selectedEvent.capacite}</Text>
                <Text style={styles.modalText}>🏷️Catégorie : {selectedEvent.categorie}</Text>

                <View style={styles.modalButtons}>
                  <Pressable style={styles.closeButton} onPress={closeModal}>
                    <Text style={styles.closeButtonText}>Fermer</Text>
                  </Pressable>
                  <Pressable style={styles.applyButton} onPress={handleApply}>
                    <Text style={styles.applyButtonText}>S'inscrire</Text>
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

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 16, paddingTop: 20 },

  /* Filtre */
  filterBox: {
    marginBottom: 20,
    backgroundColor: '#e1f1f9',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterLabel: {
    fontWeight: '600',
    color: '#007CB0',
    marginRight: 8,
    fontSize: 16,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cce5f1',
  },
  picker: {
    height: 40,
    color: '#007CB0',
    width: '80%',
  },


  eventCard: {
    backgroundColor: '#f0f9ff',
    borderLeftWidth: 6,
    borderLeftColor: '#007CB0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  eventTitle: { fontSize: 18, fontWeight: '700', color: '#007CB0', marginBottom: 10, textAlign: 'center' },
  eventDetailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  eventLabel: { fontSize: 16, width: 28 },
  eventText: { fontSize: 15, color: '#333' },

  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', color: '#007CB0' },
  modalText: { fontSize: 16, marginBottom: 12, textAlign: 'center' },

  modalButtons: { flexDirection: 'row', justifyContent: 'center', marginTop: 10 },
  closeButton: {
    backgroundColor: '#E10700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  closeButtonText: { color: 'white', fontWeight: '700' },
  applyButton: {
    backgroundColor: '#007CB0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: { color: 'white', fontWeight: '700' },
});
