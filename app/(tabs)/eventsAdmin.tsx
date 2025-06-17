/* app/(tabs)/eventsAdmin.tsx */

import { Picker } from '@react-native-picker/picker';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { onAuthStateChanged } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
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
  categorie: string;
}

/* ---------- Helper ---------- */
const notify = (title: string, msg: string, cb?: () => void) =>
  Platform.OS === 'web'
    ? (window.alert(`${title}\n\n${msg}`), cb?.())
    : Alert.alert(title, msg, [{ text: 'OK', onPress: cb }]);

/* ---------- Composant ---------- */
export default function EventsAdmin() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  /* --- états création / édition --- */
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [formTitre, setFormTitre] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCapacite, setFormCapacite] = useState('');
  const [formLieu, setFormLieu] = useState('');
  const [formDateEvt, setFormDateEvt] = useState(''); // YYYY-MM-DD
  const [formCat, setFormCat] = useState('');

  /* --- filtre catégorie --- */
  const [selectedCat, setSelectedCat] = useState<string>('ALL');

  /* -------- Auth -------- */
  useEffect(() => onAuthStateChanged(auth, () => {}), []);

  /* -------- Chargement -------- */
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

  /* -------- utils -------- */
  const resetForm = () => {
    setFormTitre('');
    setFormDescription('');
    setFormCapacite('');
    setFormLieu('');
    setFormDateEvt('');
    setFormCat('');
  };

  /* -------- ouverture modals -------- */
  const openCreate = () => {
    resetForm();
    setIsCreating(true);
    setIsEditing(false);
    setSelectedEvent(null);
    setModalVisible(true);
  };

  const openEdit = () => {
    if (!selectedEvent) return;
    setFormTitre(selectedEvent.titre);
    setFormDescription(selectedEvent.description);
    setFormCapacite(String(selectedEvent.capacite));
    setFormLieu(selectedEvent.lieu);
    setFormDateEvt(new Date(selectedEvent.date_evenement.seconds * 1000).toISOString().slice(0, 10));
    setFormCat(selectedEvent.categorie);
    setIsEditing(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setIsCreating(false);
    setIsEditing(false);
    setSelectedEvent(null);
    resetForm();
  };

  /* -------- CRUD -------- */
  const saveEdit = async () => {
    if (!selectedEvent) return;
    await updateDoc(doc(db, 'evenement', selectedEvent.id), {
      titre: formTitre,
      description: formDescription,
      capacite: Number(formCapacite),
      lieu: formLieu,
      date_evenement: new Date(formDateEvt),
      categorie: formCat,
    });
    setEvents((prev) =>
      prev.map((e) =>
        e.id === selectedEvent.id
          ? {
              ...e,
              titre: formTitre,
              description: formDescription,
              capacite: Number(formCapacite),
              lieu: formLieu,
              categorie: formCat,
              date_evenement: { seconds: new Date(formDateEvt).getTime() / 1000 },
            }
          : e
      )
    );
    notify('Événement mis à jour', 'Modifications enregistrées.');
    closeModal();
  };

  const createEvent = async () => {
    if (!formTitre || !formDateEvt || !formCapacite || !formCat) {
      notify('Champs manquants', 'Titre, date, capacité et catégorie sont obligatoires.');
      return;
    }
    const ref = await addDoc(collection(db, 'evenement'), {
      titre: formTitre,
      description: formDescription,
      capacite: Number(formCapacite),
      lieu: formLieu,
      categorie: formCat,
      date_evenement: new Date(formDateEvt),
      date_publication_evenement: new Date(),
      id_entreprise: 'junior_entreprise',
    });
    setEvents((prev) => [
      ...prev,
      {
        id: ref.id,
        titre: formTitre,
        description: formDescription,
        capacite: Number(formCapacite),
        lieu: formLieu,
        categorie: formCat,
        date_evenement: { seconds: new Date(formDateEvt).getTime() / 1000 },
        date_publication_evenement: new Date(),
        id_entreprise: 'junior_entreprise',
      } as Evenement,
    ]);
    notify('Créé', 'Événement ajouté.');
    closeModal();
  };

  const deleteEvent = async () => {
    if (!selectedEvent) return;
    const ok =
      Platform.OS === 'web'
        ? window.confirm('Supprimer cet événement ?')
        : await new Promise<boolean>((res) =>
            Alert.alert('Confirmation', 'Supprimer cet événement ?', [
              { text: 'Annuler', style: 'cancel', onPress: () => res(false) },
              { text: 'Supprimer', style: 'destructive', onPress: () => res(true) },
            ])
          );
    if (!ok) return;
    await deleteDoc(doc(db, 'evenement', selectedEvent.id));
    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    notify('Supprimé', 'Événement effacé.');
    closeModal();
  };

  /* -------- liste filtrée -------- */
  const visibleEvents =
    selectedCat === 'ALL' ? events : events.filter((e) => e.categorie === selectedCat);

  /* -------- rendu carte -------- */
  const renderItem = ({ item }: { item: Evenement }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={() => (setSelectedEvent(item), setModalVisible(true))}>
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
      <Text style={styles.header}>Gestion des événements</Text>

      {/* ---------- Filtre catégorie ---------- */}
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

      {/* FAB création */}
      <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.8}>
        <Text style={styles.fabTxt}>＋</Text>
      </TouchableOpacity>

      <FlatList
        data={visibleEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 90 }}
      />

      {/* -------- Modal -------- */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* ---- Vue détail ---- */}
            {selectedEvent && !isEditing && !isCreating && (
              <>
                <Text style={styles.modalTitle}>{selectedEvent.titre}</Text>
                <Text style={styles.modalText}>📝 {selectedEvent.description}</Text>
                <Text style={styles.modalText}>
                  📅 {new Date(selectedEvent.date_evenement.seconds * 1000).toLocaleString()}
                </Text>
                <Text style={styles.modalText}>📍 {selectedEvent.lieu}</Text>
                <Text style={styles.modalText}>👥 Capacité : {selectedEvent.capacite}</Text>
                <Text style={styles.modalText}>🏷️ {selectedEvent.categorie}</Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Text style={styles.btnTxt}>Fermer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editButton} onPress={openEdit}>
                    <Text style={styles.btnTxt}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} onPress={deleteEvent}>
                    <Text style={styles.btnTxt}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ---- Formulaire (create / edit) ---- */}
            {(isCreating || isEditing) && (
              <>
                <Text style={styles.modalTitle}>{isCreating ? 'Nouvel événement' : 'Modifier l’événement'}</Text>

                <Text style={styles.label}>Titre*</Text>
                <TextInput style={styles.input} value={formTitre} onChangeText={setFormTitre} />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  multiline
                  value={formDescription}
                  onChangeText={setFormDescription}
                />

                <Text style={styles.label}>Catégorie*</Text>
                <TextInput style={styles.input} value={formCat} onChangeText={setFormCat} />

                <Text style={styles.label}>Capacité*</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={formCapacite}
                  onChangeText={setFormCapacite}
                />

                <Text style={styles.label}>Lieu</Text>
                <TextInput style={styles.input} value={formLieu} onChangeText={setFormLieu} />

                <Text style={styles.label}>Date événement* (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={formDateEvt} onChangeText={setFormDateEvt} />

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                    <Text style={styles.btnTxt}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={isCreating ? createEvent : saveEdit}
                  >
                    <Text style={styles.btnTxt}>{isCreating ? 'Créer' : 'Enregistrer'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 15, paddingTop: 20 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 12, textAlign: 'center', color: '#007CB0' },

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

  fab: {
    position: 'absolute',
    top: 18,
    left: 15,
    backgroundColor: '#007CB0',
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  fabTxt: { color: '#fff', fontSize: 28, fontWeight: '700' },

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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center', color: '#007CB0' },
  modalText: { fontSize: 16, marginBottom: 10, textAlign: 'center' },

  modalButtons: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 12 },
  closeButton: { backgroundColor: '#aaa', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, margin: 6 },
  editButton: { backgroundColor: '#27A844', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, margin: 6 },
  deleteButton: { backgroundColor: '#E10700', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, margin: 6 },
  btnTxt: { color: '#fff', fontWeight: '700' },

  label: { marginTop: 8, fontWeight: '600', color: '#007CB0' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginTop: 4 },
});
