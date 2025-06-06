/* ───── events.tsx – version prête à copier/coller ───── */

import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
}

const notify = (
  title: string,
  message: string,
  onOk?: () => void            // callback optionnel
) => {
  if (Platform.OS === 'web') {
    // navigateur : simple window.alert
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    // mobile natif
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};


/* ---------- Composant ---------- */
export default function Event() {
  /* --- états --- */
  const [events, setEvents] = useState<Evenement[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  /* --- Auth : récupère l’UID pour id_intervenant --- */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => setFirebaseUser(user));
    return unsub;
  }, []);

  /* --- Chargement des événements --- */
  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, 'evenement'));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Evenement[];
      setEvents(data);
    };

    fetchEvents();
  }, []);

  /* --- Handlers UI --- */
  const openModal = (evt: Evenement) => {
    setSelectedEvent(evt);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedEvent(null);
  };

  /* --- Inscription Firestore --- */
  const handleApply = async () => {
    if (!selectedEvent || !firebaseUser) return;
  
    /* --- ① vérifie si l’utilisateur est déjà inscrit à cet événement --- */
    const dupQuery = query(
      collection(db, 'inscrire'),
      where('id_evenement', '==', selectedEvent.id),
      where('id_intervenant', '==', firebaseUser.uid)
    );
    const dupSnap = await getDocs(dupQuery);
    if (!dupSnap.empty) {
      notify('Déjà inscrit', 'Vous êtes déjà inscrit à cet événement.');
      return; // stoppe ici si un doc existe déjà
    }
  
    /* --- ② inscription si aucune entrée trouvée --- */
    try {
      await addDoc(collection(db, 'inscrire'), {
        date_inscription: serverTimestamp(),
        id_evenement: selectedEvent.id,
        id_intervenant: firebaseUser.uid,
        statut: 'en attente',
      });
  
      notify('Inscription envoyée', 'Votre inscription est enregistrée.', closeModal);
      closeModal();
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', "Une erreur s'est produite lors de l'inscription.");
    }
  };
  

  /* --- Render --- */
  const renderItem = ({ item }: { item: Evenement }) => (
    <TouchableOpacity onPress={() => openModal(item)} activeOpacity={0.8}>
      <View style={styles.itemContainer}>
        <Text style={styles.title}>{item.titre}</Text>
        <Text style={styles.dates}>
          {new Date(item.date_evenement.seconds * 1000).toLocaleDateString()} —{' '}
          {item.lieu}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Événements</Text>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedEvent && (
              <>
                <Text style={styles.modalTitle}>{selectedEvent.titre}</Text>
                <Text style={styles.modalText}>
                  Description : {selectedEvent.description}
                </Text>
                <Text style={styles.modalText}>
                  Date :{' '}
                  {new Date(
                    selectedEvent.date_evenement.seconds * 1000
                  ).toLocaleString()}
                </Text>
                <Text style={styles.modalText}>
                  Lieu : {selectedEvent.lieu}
                </Text>
                <Text style={styles.modalText}>
                  Capacité : {selectedEvent.capacite}
                </Text>

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
  dates: {
    fontSize: 14,
    color: '#e0f4ff',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  closeButton: {
    backgroundColor: '#aaa',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '700',
  },
  applyButton: {
    backgroundColor: '#007CB0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: '700',
  },
});
