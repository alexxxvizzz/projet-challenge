import { onAuthStateChanged, User } from 'firebase/auth';
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
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
  View,
} from 'react-native';
import { auth, db } from '../../utils/firebase';

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

const notify = (
  title: string,
  message: string,
  onOk?: () => void
) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    onOk?.();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};

export default function Studies() {
  const [etudes, setEtudes] = useState<Etude[]>([]);
  const [selectedEtude, setSelectedEtude] = useState<Etude | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const fetchEtudes = async () => {
      const snapshot = await getDocs(collection(db, 'etude'));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Etude[];
      setEtudes(data);
    };

    fetchEtudes();
  }, []);

  const handleOpenModal = (etude: Etude) => {
    setSelectedEtude(etude);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedEtude(null);
  };

  const handleApply = async () => {
    if (!selectedEtude || !firebaseUser) return;

    const dupQuery = query(
      collection(db, 'postuler'),
      where('id_etude', '==', selectedEtude.id),
      where('id_intervenant', '==', firebaseUser.uid)
    );
    const dupSnap = await getDocs(dupQuery);
    if (!dupSnap.empty) {
      notify('Déjà candidaté', 'Vous avez déjà postulé à cette étude.');
      return;
    }

    try {
      await addDoc(collection(db, 'postuler'), {
        date_postulation: serverTimestamp(),
        id_etude: selectedEtude.id,
        id_intervenant: firebaseUser.uid,
        statut: 'en attente',
      });

      notify('Candidature envoyée', 'Votre candidature est enregistrée.', handleCloseModal);
      handleCloseModal();
    } catch (e) {
      console.error(e);
      Alert.alert('Erreur', "Une erreur s'est produite ; réessaye plus tard.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'ouverte':
        return '#4CAF50'; // vert
      case 'fermé':
        return '#FF5722'; // orange/rouge
      case 'en attente':
      default:
        return '#2196F3'; // bleu
    }
  };

  const renderItem = ({ item }: { item: Etude }) => (
    <TouchableOpacity onPress={() => handleOpenModal(item)} activeOpacity={0.9}>
      <View style={styles.itemContainer}>
        <Text style={styles.title}>{item.titre}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📅 Dates :</Text>
          <Text style={styles.value}>
            {new Date(item.date_debut.seconds * 1000).toLocaleDateString()} →{' '}
            {new Date(item.date_fin.seconds * 1000).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>📌 Statut :</Text>
          <View
            style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) }]}
          >
            <Text style={styles.statusText}>{item.statut}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={etudes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedEtude && (
              <>
                <Text style={styles.modalTitle}>{selectedEtude.titre}</Text>
                <Text style={styles.modalText}>📝Description : {selectedEtude.description}</Text>
                <Text style={styles.modalText}>
                  🕒Début :{' '}
                  {new Date(selectedEtude.date_debut.seconds * 1000).toLocaleDateString()}
                </Text>
                <Text style={styles.modalText}>
                  🕓Fin :{' '}
                  {new Date(selectedEtude.date_fin.seconds * 1000).toLocaleDateString()}
                </Text>
                <Text style={styles.modalText}>📌Statut : {selectedEtude.statut}</Text>

                <View style={styles.modalButtons}>
                  <Pressable style={styles.closeButton} onPress={handleCloseModal}>
                    <Text style={styles.closeButtonText}>Fermer</Text>
                  </Pressable>
                  <Pressable style={styles.applyButton} onPress={handleApply}>
                    <Text style={styles.applyButtonText}>Postuler</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 20,
  },

  itemContainer: {
    backgroundColor: '#f0f9ff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#007CB0',
    marginBottom: 10,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 5,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#555',
  },
  value: {
    fontSize: 14,
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    marginLeft: 5,
  },
  statusText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
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
    color: '#007CB0',
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
    backgroundColor: '#E10700',
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
