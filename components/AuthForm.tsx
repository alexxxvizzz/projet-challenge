import { useState } from 'react'
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

export default function AuthForm({
  type,
  onSubmit,
}: {
  type: 'login' | 'register'
  onSubmit: (
    email: string,
    password: string,
    confirm?: string,
    firstName?: string,
    lastName?: string,
    phone?: string,
  ) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  const handlePress = () => {
    onSubmit(
      email.trim(),
      password,
      confirm,
      firstName.trim(),
      lastName.trim(),
      phone.trim(),
    )
  }

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEPIHgzIIPcxP-DOsghno4c-bUS3qGjBsdcw&s',
        }}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>
        {type === 'login' ? 'Sign In' : 'Sign Up'}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        value={email}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={setPassword}
        value={password}
      />

      {type === 'register' && (
        <>
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            secureTextEntry
            onChangeText={setConfirm}
            value={confirm}
          />

          <TextInput
            style={styles.input}
            placeholder="First Name"
            autoCapitalize="words"
            onChangeText={setFirstName}
            value={firstName}
          />

          <TextInput
            style={styles.input}
            placeholder="Last Name"
            autoCapitalize="words"
            onChangeText={setLastName}
            value={lastName}
          />

          <TextInput
            style={styles.input}
            placeholder="Phone"
            keyboardType="phone-pad"
            onChangeText={setPhone}
            value={phone}
          />
        </>
      )}

      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>
          {type === 'login' ? 'Login' : 'Register'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 32,
    color: '#1E293B',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    
  },
  button: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
})
