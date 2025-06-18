import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import AuthForm from '../../components/AuthForm';
import { auth } from '../../utils/firebase';

/**
 * Convertit les codes d’erreur Firebase en messages clairs pour l’utilisateur.
 */
const translateFirebaseError = (code: string | undefined): string => {
  switch (code) {
    case 'auth/invalid-email':
      return "Adresse e‑mail invalide.";
    case 'auth/user-not-found':
      return "Aucun compte ne correspond à cette adresse e‑mail.";
    case 'auth/wrong-password':
      return "Mot de passe incorrect.";
    case 'auth/network-request-failed':
      return "Problème de connexion réseau. Réessayez plus tard.";
    default:
      return "Une erreur est survenue. Veuillez réessayer.";
  }
};

export default function Login() {
  const [error, setError] = useState<string>('');

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(''); // on réinitialise l’erreur avant chaque tentative
      await signInWithEmailAndPassword(auth, email, password);
      // ⛔️ plus de router.replace ici
    } catch (e: any) {
      // On transforme le code d’erreur Firebase en message lisible
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
      <AuthForm type="login" onSubmit={handleLogin} />

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

      <TouchableOpacity
        onPress={() => router.push('/(auth)/register')}
        style={{
          marginTop: 10,
          alignSelf: 'center',
        }}
      >
        <Text style={{ color: 'blue', fontWeight: '500' }}>
          Pas de compte ? Vous inscrire
        </Text>
      </TouchableOpacity>
    </View>
  );
}