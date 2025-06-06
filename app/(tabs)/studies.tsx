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
  View
} from 'react-native';
import { auth, db } from '../../utils/firebase';


interface Etude {
  id: string
  titre: string
  description: string
  date_debut: any
  date_fin: any
  date_publication: any
  statut: string
  id_entreprise: string
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

export default function Studies() {
  const [etudes, setEtudes] = useState<Etude[]>([])
  const [selectedEtude, setSelectedEtude] = useState<Etude | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      
    });
    return unsub;
  }, []);
  

  useEffect(() => {
    const fetchEtudes = async () => {
      const snapshot = await getDocs(collection(db, 'etude'))
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Etude[]
      setEtudes(data)
    }

    fetchEtudes()
  }, [])

  const handleOpenModal = (etude: Etude) => {
    setSelectedEtude(etude)
    setModalVisible(true)
  }

  const handleCloseModal = () => {
    setModalVisible(false)
    setSelectedEtude(null)
  }


  const handleApply = async () => {
    if (!selectedEtude || !firebaseUser) return;
  
    /* --- ① vérifie si une candidature existe déjà --- */
    const dupQuery = query(
      collection(db, 'postuler'),
      where('id_etude', '==', selectedEtude.id),
      where('id_intervenant', '==', firebaseUser.uid)
    );
    const dupSnap = await getDocs(dupQuery);
    if (!dupSnap.empty) {
      notify('Déjà candidaté', 'Vous avez déjà postulé à cette étude.');
      return; // stoppe la fonction, donc aucun addDoc
    }
  
    /* --- ② sinon, on enregistre la nouvelle candidature --- */
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
  
  
  const renderItem = ({ item }: { item: Etude }) => (
    <TouchableOpacity onPress={() => handleOpenModal(item)} activeOpacity={0.8}>
      <View style={styles.itemContainer}>
        <Text style={styles.title}>{item.titre}</Text>
        <Text style={styles.dates}>
          {new Date(item.date_debut.seconds * 1000).toLocaleDateString()} →{' '}
          {new Date(item.date_fin.seconds * 1000).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Études disponibles</Text>

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
                <Text style={styles.modalText}>
                  Description : {selectedEtude.description}
                </Text>
                <Text style={styles.modalText}>
                  Début :{' '}
                  {new Date(
                    selectedEtude.date_debut.seconds * 1000,
                  ).toLocaleDateString()}
                </Text>
                <Text style={styles.modalText}>
                  Fin :{' '}
                  {new Date(
                    selectedEtude.date_fin.seconds * 1000,
                  ).toLocaleDateString()}
                </Text>
                <Text style={styles.modalText}>Statut : {selectedEtude.statut}</Text>

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
  )
}

const styles = StyleSheet.create({
  // ---- Global container ----
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 20,
  },

  // ---- Header ----
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    color: '#007CB0',
  },

  // ---- FlatList item ----
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

  // ---- Modal overlay ----
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  // ---- Modal content ----
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

  // ---- Modal buttons ----
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
})
