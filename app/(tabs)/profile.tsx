import { router } from 'expo-router'
import { onAuthStateChanged, signOut, User } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { auth, db } from '../../utils/firebase'


interface UserProfile {
  firstName?: string
  lastName?: string
  phone?: string
  // ➜ ajoute ici d’autres champs si nécessaire
}

export default function Profile() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  /* ---------- Édition ---------- */
  const [isEditing, setIsEditing] = useState(false)
  const [editFirstName, setEditFirstName] = useState('')
  const [editLastName, setEditLastName] = useState('')
  const [editPhone, setEditPhone] = useState('')
  const [saving, setSaving] = useState(false)

  /* ---------- Auth + Firestore ---------- */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)

      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid))
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile)
          }
        } catch (e) {
          console.error(e)
        }
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  /* ---------- Actions ---------- */
  const handleLogout = async () => {
    await signOut(auth)
    router.replace('/(auth)/login')
  }
  const handleHistory = () => {
    router.push('/History')          // 👉 navigation vers la page Historique
  }
  const openEdit = () => {
    if (profile) {
      setEditFirstName(profile.firstName ?? '')
      setEditLastName(profile.lastName ?? '')
      setEditPhone(profile.phone ?? '')
    }
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!firebaseUser) return
    try {
      setSaving(true)
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
      })
      setProfile({
        ...profile,
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
      })
      setIsEditing(false)
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  /* ---------- UI ---------- */
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007CB0" />
      </View>
    )
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.header}>Profil</Text>

        {firebaseUser ? (
          <>
            {/* Champs Firestore */}
            <Text style={styles.field}>
              <Text style={styles.label}>Nom : </Text>
              <Text style={styles.value}>{profile?.lastName || '—'}</Text>
            </Text>
            <Text style={styles.field}>
              <Text style={styles.label}>Prénom : </Text>
              <Text style={styles.value}>{profile?.firstName || '—'}</Text>
            </Text>
            <Text style={styles.field}>
              <Text style={styles.label}>Téléphone : </Text>
              <Text style={styles.value}>{profile?.phone || '—'}</Text>
            </Text>

            {/* Email provenant directement d’Auth */}
            <Text style={styles.field}>
              <Text style={styles.label}>Email : </Text>
              <Text style={styles.value}>{firebaseUser.email}</Text>
            </Text>

            <View style={styles.historyButtonContainer}>
              <Button title="Mon historique" onPress={handleHistory} color="#007CB0" />
            </View>

            <View style={styles.buttonRow}>
              <Button title="Modifier" onPress={openEdit} color="#007CB0" />
              <View style={{ width: 10 }} />
              <Button title="Se déconnecter" onPress={handleLogout} color="#007CB0" />
            </View>
          </>
        ) : (
          <Text style={styles.value}>Utilisateur non connecté</Text>
        )}
      </ScrollView>

      {/* ---------- Modal édition ---------- */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={editLastName}
                onChangeText={setEditLastName}
                placeholder="Nom"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={editFirstName}
                onChangeText={setEditFirstName}
                placeholder="Prénom"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={editPhone}
                onChangeText={setEditPhone}
                placeholder="Téléphone"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email (non modifiable)</Text>
              <Text style={styles.value}>{firebaseUser?.email}</Text>
            </View>

            <View style={styles.modalButtonRow}>
              <TouchableOpacity
                style={styles.modalButtonSecondary}
                onPress={() => setIsEditing(false)}
                disabled={saving}
              >
                <Text style={styles.modalButtonTextSecondary}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  historyButtonContainer: {
    marginTop: 20,
    alignSelf: 'stretch',
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'flex-start',
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 25,
    color: '#333',
  },
  field: {
    marginBottom: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: '600',
    color: '#007CB0',
    fontSize: 13,
  },
  value: {
    fontSize: 16,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignSelf: 'stretch',
  },
  /* ---------- Modal styles ---------- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  modalButtonPrimary: {
    backgroundColor: '#007CB0',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginLeft: 10,
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  modalButtonSecondary: {
    backgroundColor: '#f4f4f4',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  modalButtonTextSecondary: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
  },
})
