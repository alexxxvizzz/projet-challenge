import { router } from 'expo-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { Alert, ScrollView, StyleSheet } from 'react-native'
import AuthForm from '../../components/AuthForm'
import { auth, db } from '../../utils/firebase'

export default function RegisterScreen() {
  const handleRegister = async (
    email: string,
    password: string,
    confirm?: string,
    firstName = '',
    lastName = '',
    phone = '',
  ) => {
    if (password !== confirm) {
      return Alert.alert("Les mots de passe ne correspondent pas")
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        phone,
        email,
        createdAt: serverTimestamp(),
      })

      router.replace('/(tabs)/articles')
    } catch (e: any) {
      Alert.alert('Erreur d’inscription', e.message)
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthForm type="register" onSubmit={handleRegister} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
})

