import { router } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import AuthForm from '../../components/AuthForm';
import { auth, db } from '../../utils/firebase';

/**
 * Convertit les codes d’erreur Firebase en messages clairs pour l’utilisateur.
 */
const translateFirebaseError = (code: string | undefined): string => {
  switch (code) {
    case 'auth/invalid-email':
      return 'Adresse e-mail invalide.';
    case 'auth/email-already-in-use':
      return 'Un compte existe déjà avec cette adresse e-mail.';
    case 'auth/weak-password':
      return 'Mot de passe trop faible. Utilisez au moins 6 caractères.';
    case 'auth/network-request-failed':
      return 'Problème de connexion réseau. Réessayez plus tard.';
    default:
      return 'Une erreur est survenue. Veuillez réessayer.';
  }
};

export default function RegisterScreen() {
  const [error, setError] = useState<string>('');

  /**
   * Signature conforme à AuthForm :
   *  (email, password, confirm?, firstName?, lastName?, phone?) => void|Promise<void>
   */
  const handleRegister = async (
    email: string,
    password: string,
    confirm?: string,
    firstName = '',
    lastName = '',
    phone = ''
  ) => {
    // 1️⃣  Vérif mot de passe
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      setError(''); // Réinitialise l’erreur avant la tentative

      // 2️⃣  Création Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // 3️⃣  Écriture Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        phone,
        email,
        isAdmin: false, // ⇦ rôle par défaut
        createdAt: serverTimestamp(),
      });

      // 4️⃣  Navigation
      router.replace('/articles');
    } catch (e: any) {
      const message = translateFirebaseError(e?.code);
      setError(message);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
      }}
    >
      <AuthForm type="register" onSubmit={handleRegister} />

      {/* Affiche le message d'erreur si présent */}
      {error !== '' && (
        <Text
          style={{
            color: 'red',
            textAlign: 'center',
            marginTop: 10,
            fontWeight: '500',
          }}
        >
          {error}
        </Text>
      )}
    </View>
  );
}