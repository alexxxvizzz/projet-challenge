import { useState } from 'react'
import { Button, StyleSheet, Text, TextInput, View } from 'react-native'

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
  /* ---- États ---- */
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')

  /* ---- Handler ---- */
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

  /* ---- UI ---- */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {type === 'login' ? 'Sign In' : 'Sign Up'}
      </Text>

      {/* ---- Email & Password (communs) ---- */}
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

      {/* ---- Champs supplémentaires pour l’inscription ---- */}
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

      {/* ---- Bouton principal ---- */}
      <Button
        title={type === 'login' ? 'Login' : 'Register'}
        onPress={handlePress}
      />
    </View>
  )
}

/* ---- Styles ---- */
const styles = StyleSheet.create({
  container: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
})
