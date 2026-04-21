import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!username || !password) {
      Alert.alert('Missing fields', 'Enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(username.trim(), password);
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.detail || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.brand}>VitalStream</Text>
          <Text style={styles.tag}>A digital bridge between donors and hospitals.</Text>
        </View>
        <TextField label="Username" autoCapitalize="none" value={username} onChangeText={setUsername} />
        <TextField label="Password" secureTextEntry value={password} onChangeText={setPassword} />
        <Button title="Sign In" onPress={submit} loading={loading} />
        <Button
          title="Create an account"
          variant="secondary"
          onPress={() => navigation.navigate('Register')}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 80 },
  hero: { marginBottom: 32, alignItems: 'center' },
  brand: { fontSize: 32, fontWeight: '800', color: colors.primary },
  tag: { marginTop: 6, color: colors.subtext, textAlign: 'center' },
});
