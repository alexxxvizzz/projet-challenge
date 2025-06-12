import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import AuthForm from '../../components/AuthForm';
import { auth } from '../../utils/firebase';

export default function Login() {
  const handleLogin = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // ⛔️ plus de router.replace ici
    } catch (e: any) {
      Alert.alert('Login error', e.message);
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

