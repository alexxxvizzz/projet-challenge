import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { auth, db } from '../../utils/firebase';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  phone?: string;
  github?: string;
}

export default function Profile() {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGithub, setEditGithub] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);

      if (user) {
        try {
          const snap = await getDoc(doc(db, 'users', user.uid));
          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          }
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.replace('/(auth)/login');
  };

  const handleHistory = () => {
    router.push('/History');
  };

  const openEdit = () => {
    if (profile) {
      setEditFirstName(profile.firstName ?? '');
      setEditLastName(profile.lastName ?? '');
      setEditPhone(profile.phone ?? '');
      setEditGithub(profile.github ?? '');
    }
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!firebaseUser) return;
    try {
      setSaving(true);
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        github: editGithub,
      });
      setProfile({
        ...profile,
        firstName: editFirstName,
        lastName: editLastName,
        phone: editPhone,
        github: editGithub,
      });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007CB0" />
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="person" size={60} color="#fff" />
          </View>
        </View>

        {firebaseUser ? (
          <>
            <View style={styles.card}>
              <Field label="Nom" value={profile?.lastName || '—'} />
              <Field label="Prénom" value={profile?.firstName || '—'} />
              <Field label="Téléphone" value={profile?.phone || '—'} />
              <Field label="Email" value={firebaseUser.email || '—'} />
              <Field label="Lien GitHub" value={profile?.github || '—'} isLink />
            </View>

            <TouchableOpacity
              style={styles.historyButton}
              onPress={handleHistory}
              activeOpacity={0.8}
            >
              <MaterialIcons name="history" size={20} color="#fff" />
              <Text style={styles.historyButtonText}> Mon historique</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary]}
                onPress={openEdit}
                activeOpacity={0.8}
              >
                <MaterialIcons name="edit" size={20} color="#fff" />
                <Text style={styles.buttonText}> Modifier</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleLogout}
                activeOpacity={0.8}
              >
                <MaterialIcons name="logout" size={20} color="#fff" />
                <Text style={styles.buttonText}> Se déconnecter</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <Text style={styles.value}>Utilisateur non connecté</Text>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* --------------------------------------------------- */}
      {/* ⬇️ Modal d'édition du profil                          */}
      {/* --------------------------------------------------- */}
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent
        onRequestClose={() => setIsEditing(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier le profil</Text>

            {/* --- Champ Nom --- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                value={editLastName}
                onChangeText={setEditLastName}
                placeholder="Nom"
              />
            </View>

            {/* --- Champ Prénom --- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                value={editFirstName}
                onChangeText={setEditFirstName}
                placeholder="Prénom"
              />
            </View>

            {/* --- Champ Téléphone --- */}
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

            {/* --- Champ GitHub --- */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Lien GitHub</Text>
              <TextInput
                style={styles.input}
                value={editGithub}
                onChangeText={setEditGithub}
                placeholder="https://github.com/monprofil"
                autoCapitalize="none"
              />
            </View>

            {/* --- Email (non‑éditable) --- */}
            <View style={styles.field}>
              <Text style={styles.label}>Email :</Text>
              <Text style={styles.value}>{firebaseUser?.email}</Text>
            </View>

            {/* --- Boutons du modal --- */}
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
  );
}

interface FieldProps {
  label: string;
  value: string;
  /** Si true et que la valeur ressemble à une URL, on la rend cliquable */
  isLink?: boolean;
}

function Field({ label, value, isLink = false }: FieldProps) {
  const isUrl = isLink && /^https?:\/\//i.test(value);

  const handlePress = () => {
    if (isUrl) {
      Linking.openURL(value).catch((err) => console.warn('Cannot open URL', err));
    }
  };

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label} :</Text>

      {isUrl ? (
        <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
          <Text
            style={[
              styles.value,
              { color: '#007CB0', textDecorationLine: 'underline' },
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {value}
          </Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.value}>{value}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  content: {
    flexGrow: 1,
    backgroundColor: '#fff',
    paddingTop: 20,
    paddingHorizontal: 25,
    paddingBottom: 40,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  iconCircle: {
    backgroundColor: '#007CB0',
    borderRadius: 60,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  field: {
    flexDirection: 'row',
    marginBottom: 14,
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  label: {
    fontWeight: '600',
    color: '#007CB0',
    fontSize: 14,
    width: 100,
  },
  value: {
    fontSize: 16,
    color: '#333',
    flexShrink: 1,
  },
  historyButton: {
    flexDirection: 'row',
    backgroundColor: '#007CB0',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  historyButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flexDirection: 'row',
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  buttonPrimary: {
    backgroundColor: '#007CB0',
    marginRight: 10,
  },
  buttonSecondary: {
    backgroundColor: '#E10700',
  },
  buttonText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#fff',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 25,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#007CB0',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
  },
  modalButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButtonPrimary: {
    backgroundColor: '#007CB0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 25,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  modalButtonSecondary: {
    backgroundColor: '#E10700',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 25,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  modalButtonTextSecondary: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
