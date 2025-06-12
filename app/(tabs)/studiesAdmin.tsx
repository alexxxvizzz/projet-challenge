/* app/(tabs)/studiesAdmin.tsx */
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
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
import { auth, db } from '../../utils/firebase';

/* ---------- Types ---------- */
interface Etude {
  id: string;
  titre: string;
  description: string;
  date_debut: any;
  date_fin: any;
  date_publication: any;
  statut: string;
  id_entreprise: string;
}

/* ---------- Helper ---------- */
const notify = (title: string, msg: string, cb?: () => void) =>
  Platform.OS === 'web'
    ? (window.alert(`${title}\n\n${msg}`), cb?.())
    : Alert.alert(title, msg, [{ text: 'OK', onPress: cb }]);

/* ---------- Composant ---------- */
export default function StudiesAdmin() {
  const [etudes, setEtudes] = useState<Etude[]>([]);
  const [selectedEtude, setSelectedEtude] = useState<Etude | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  /* ---- états édition / création ---- */
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editTitre, setEditTitre] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatut, setEditStatut] = useState('');
  const [editDateDebut, setEditDateDebut] = useState('');
  const [editDateFin, setEditDateFin] = useState('');

  /* ---------- Auth ---------- */
  useEffect(() => onAuthStateChanged(auth, setFirebaseUser), []);

  /* ---------- Load études ---------- */
  useEffect(() => {
    getDocs(collection(db, 'etude')).then((snap) =>
      setEtudes(snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Etude[])
    );
  }, []);

  /* ---------- utils ---------- */
  const resetFields = () => {
    setEditTitre('');
    setEditDescription('');
    setEditStatut('');
    setEditDateDebut('');
    setEditDateFin('');
  };

  /* ---------- ouverture modals ---------- */
  const openCreate = () => {
    resetFields();
    setModalVisible(true); // 👉 visible en premier
    setIsCreating(true);
    setIsEditing(false);
    setSelectedEtude(null);
  };

  const openEdit = () => {
    if (!selectedEtude) return;
    setEditTitre(selectedEtude.titre);
    setEditDescription(selectedEtude.description);
    setEditStatut(selectedEtude.statut);
    setEditDateDebut(new Date(selectedEtude.date_debut.seconds * 1000).toISOString().slice(0, 10));
    setEditDateFin(new Date(selectedEtude.date_fin.seconds * 1000).toISOString().slice(0, 10));
    setIsEditing(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setIsEditing(false);
    setIsCreating(false);
    setSelectedEtude(null);
    resetFields();
  };

  /* ---------- CRUD ---------- */
  const saveEdit = async () => {
    if (!selectedEtude) return;
    try {
      await updateDoc(doc(db, 'etude', selectedEtude.id), {
        titre: editTitre,
        description: editDescription,
        statut: editStatut,
        date_debut: new Date(editDateDebut),
        date_fin: new Date(editDateFin),
      });
      setEtudes((prev) =>
        prev.map((e) =>
          e.id === selectedEtude.id
            ? {
                ...e,
                titre: editTitre,
                description: editDescription,
                statut: editStatut,
                date_debut: { seconds: new Date(editDateDebut).getTime() / 1000 },
                date_fin: { seconds: new Date(editDateFin).getTime() / 1000 },
              }
            : e
        )
      );
      notify('Étude mise à jour', 'Modifications enregistrées.');
      handleCloseModal();
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    }
  };

  const createEtude = async () => {
    /* --- validations rapides --- */
    if (!editTitre || !editDateDebut || !editDateFin) {
      notify('Champs manquants', 'Titre et dates sont obligatoires');
      return;
    }
    try {
      const ref = await addDoc(collection(db, 'etude'), {
        titre: editTitre,
        description: editDescription,
        statut: editStatut || 'ouverte',
        date_debut: new Date(editDateDebut),
        date_fin: new Date(editDateFin),
        date_publication: new Date(),
        id_entreprise: 'junior_entreprise',
      });
      setEtudes((prev) => [
        ...prev,
        {
          id: ref.id,
          titre: editTitre,
          description: editDescription,
          statut: editStatut || 'ouverte',
          date_debut: { seconds: new Date(editDateDebut).getTime() / 1000 },
          date_fin: { seconds: new Date(editDateFin).getTime() / 1000 },
          date_publication: new Date(),
          id_entreprise: 'junior_entreprise',
        } as Etude,
      ]);
      notify('Étude créée', 'La nouvelle étude a été ajoutée.');
      handleCloseModal();
    } catch (e: any) {
      console.error(e);
      Alert.alert('Erreur', e.message ?? 'Création impossible.');
    }
  };

  /* ---------- Supprime étude ---------- */
const deleteEtude = async () => {
  if (!selectedEtude) return;

  /* ----- Web : window.confirm ----- */
  if (Platform.OS === 'web') {
    const ok = window.confirm('Supprimer cette étude ?');
    if (!ok) return;
    try {
      await deleteDoc(doc(db, 'etude', selectedEtude.id));
      setEtudes((prev) => prev.filter((e) => e.id !== selectedEtude.id));
      notify('Supprimée', 'Étude effacée.');
      handleCloseModal();
    } catch (e) {
      console.error(e);
      alert('Erreur : suppression impossible.');
    }
    return;
  }

  /* ----- Mobile natif : Alert.alert ----- */
  Alert.alert('Confirmation', 'Supprimer cette étude ?', [
    { text: 'Annuler', style: 'cancel' },
    {
      text: 'Supprimer',
      style: 'destructive',
      onPress: async () => {
        try {
          await deleteDoc(doc(db, 'etude', selectedEtude.id));
          setEtudes((prev) => prev.filter((e) => e.id !== selectedEtude.id));
          notify('Supprimée', 'Étude effacée.');
          handleCloseModal();
        } catch (e) {
          console.error(e);
          Alert.alert('Erreur', 'Suppression impossible.');
        }
      },
    },
  ]);
};


  /* ---------- rendu carte ---------- */
  const renderItem = ({ item }: { item: Etude }) => (
    <TouchableOpacity onPress={() => (setSelectedEtude(item), setModalVisible(true))}>
      <View style={styles.itemContainer}>
        <Text style={styles.title}>{item.titre}</Text>
        <Text style={styles.dates}>
          {new Date(item.date_debut.seconds * 1000).toLocaleDateString()} →{' '}
          {new Date(item.date_fin.seconds * 1000).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  /* ---------- JSX ---------- */
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Gestion des études</Text>

      {/* -------- FAB crée -------- */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8} onPress={openCreate}>
        <Text style={styles.fabTxt}>＋</Text>
      </TouchableOpacity>

      <FlatList
        data={etudes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 90 }}
      />

      {/* -------- Modal -------- */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            {/* ---------------- Vue détail ---------------- */}
            {selectedEtude && !isEditing && !isCreating && (
              <>
                <Text style={styles.modalTitle}>{selectedEtude.titre}</Text>
                <Text style={styles.modalText}>Description : {selectedEtude.description}</Text>
                <Text style={styles.modalText}>
                  Début : {new Date(selectedEtude.date_debut.seconds * 1000).toLocaleDateString()}
                </Text>
                <Text style={styles.modalText}>
                  Fin : {new Date(selectedEtude.date_fin.seconds * 1000).toLocaleDateString()}
                </Text>
                <Text style={styles.modalText}>Statut : {selectedEtude.statut}</Text>

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.closeButton} activeOpacity={0.8} onPress={handleCloseModal}>
                    <Text style={styles.btnTxt}>Fermer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.editButton} activeOpacity={0.8} onPress={openEdit}>
                    <Text style={styles.btnTxt}>Modifier</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteButton} activeOpacity={0.8} onPress={deleteEtude}>
                    <Text style={styles.btnTxt}>Supprimer</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* ---------------- Formulaire (create/edit) ---------------- */}
            {(isEditing || isCreating) && (
              <>
                <Text style={styles.modalTitle}>{isCreating ? 'Nouvelle étude' : 'Modifier l’étude'}</Text>

                <Text style={styles.label}>Titre*</Text>
                <TextInput style={styles.input} value={editTitre} onChangeText={setEditTitre} />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  multiline
                  value={editDescription}
                  onChangeText={setEditDescription}
                />

                <Text style={styles.label}>Statut</Text>
                <TextInput style={styles.input} value={editStatut} onChangeText={setEditStatut} />

                <Text style={styles.label}>Date début* (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={editDateDebut} onChangeText={setEditDateDebut} />

                <Text style={styles.label}>Date fin* (YYYY-MM-DD)</Text>
                <TextInput style={styles.input} value={editDateFin} onChangeText={setEditDateFin} />

                <View style={styles.modalButtons}>
                  <TouchableOpacity style={styles.closeButton} activeOpacity={0.8} onPress={handleCloseModal}>
                    <Text style={styles.btnTxt}>Annuler</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.editButton}
                    activeOpacity={0.8}
                    onPress={isCreating ? createEtude : saveEdit}
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
  header: { fontSize: 24, fontWeight: '700', marginBottom: 16, textAlign: 'center', color: '#007CB0' },

  /* Fab */
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
  fabTxt: { color: '#fff', fontSize: 28, lineHeight: 28, fontWeight: '700' },

  /* List card */
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
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8, color: '#fff', textAlign: 'center' },
  dates: { fontSize: 14, color: '#e0f4ff', textAlign: 'center' },

  /* Modal */
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
  closeButton: {
    backgroundColor: '#aaa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 6,
  },
  editButton: {
    backgroundColor: '#27A844',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 6,
  },
  deleteButton: {
    backgroundColor: '#E10700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    margin: 6,
  },

  btnTxt: { color: '#fff', fontWeight: '700' },

  label: { marginTop: 8, fontWeight: '600', color: '#007CB0' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 6, padding: 8, marginTop: 4 },
});
