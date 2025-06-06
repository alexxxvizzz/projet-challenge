import { signInWithEmailAndPassword } from 'firebase/auth'
import { Alert } from 'react-native'
import AuthForm from '../../components/AuthForm'
import { auth } from '../../utils/firebase'

export default function Login() {
  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // ⛔️ plus de router.replace ici
    } catch (e: any) {
      Alert.alert('Login error', e.message);
    }
  };

  return <AuthForm type="login" onSubmit={handleLogin} />;
}

