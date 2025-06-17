import { useState } from 'react'
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

/**
 * Props :
 *  - type   : 'login' | 'register'
 *  - onSubmit :
 *        login     → (email, password)
 *        register  → (email, password, confirm, firstName, lastName, phone)
 */
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

  return type === 'register' ? (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <AuthFields
        type={type}
        email={email}
        password={password}
        confirm={confirm}
        firstName={firstName}
        lastName={lastName}
        phone={phone}
        setEmail={setEmail}
        setPassword={setPassword}
        setConfirm={setConfirm}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setPhone={setPhone}
        handlePress={handlePress}
      />
    </ScrollView>
  ) : (
    <View style={styles.container}>
      <AuthFields
        type={type}
        email={email}
        password={password}
        confirm={confirm}
        firstName={firstName}
        lastName={lastName}
        phone={phone}
        setEmail={setEmail}
        setPassword={setPassword}
        setConfirm={setConfirm}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setPhone={setPhone}
        handlePress={handlePress}
      />
    </View>
  )
}

function AuthFields({
  type,
  email,
  password,
  confirm,
  firstName,
  lastName,
  phone,
  setEmail,
  setPassword,
  setConfirm,
  setFirstName,
  setLastName,
  setPhone,
  handlePress,
}: {
  type: 'login' | 'register'
  email: string
  password: string
  confirm: string
  firstName: string
  lastName: string
  phone: string
  setEmail: (text: string) => void
  setPassword: (text: string) => void
  setConfirm: (text: string) => void
  setFirstName: (text: string) => void
  setLastName: (text: string) => void
  setPhone: (text: string) => void
  handlePress: () => void
}) {
  return (
    <>
      <Image
        source={{
          uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEPIHgzIIPcxP-DOsghno4c-bUS3qGjBsdcw&s',
        }}
        style={styles.logo}
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

      <TouchableOpacity style={styles.buttonContainer} onPress={handlePress}>
        <Text style={styles.buttonText}>
          {type === 'login' ? 'Login' : 'Register'}
        </Text>
      </TouchableOpacity>
    </>
  )
}

/* ---- Styles ---- */
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
  },

  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 16,
    borderRadius: 75,
    overflow: 'hidden',
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007CB0',
    marginBottom: 24,
    textAlign: 'center',
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cce5f1',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },

  buttonContainer: {
    backgroundColor: '#007CB0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
