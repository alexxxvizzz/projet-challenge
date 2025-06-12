// src/app/(auth)/register.tsx
import { router } from 'expo-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Alert } from 'react-native'
import AuthForm from '../../components/AuthForm'
import { auth, db } from '../../utils/firebase'

export default function RegisterScreen() {
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
    phone = '',
  ) => {
    // 1️⃣  Vérif mot de passe
    if (password !== confirm) {
      return Alert.alert("Les mots de passe ne correspondent pas")
    }

    try {
      // 2️⃣  Création Auth
      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      // 3️⃣  Écriture Firestore
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        phone,
        email,
        isAdmin: false,            // ⇦ rôle par défaut
        createdAt: serverTimestamp(),
      })

      // 4️⃣  Navigation
      router.replace('/(tabs)/articles')
    } catch (e: any) {
      Alert.alert('Erreur d’inscription', e.message)
    }
  }

  return <AuthForm type="register" onSubmit={handleRegister} />
}
