import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS, colors } from '../../theme/colors';

type Role = 'donor' | 'hospital_admin';

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [role, setRole] = useState<Role>('donor');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    blood_group: 'O+',
    date_of_birth: '',
    hospital_name: '',
    hospital_address: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (!form.username || !form.password) {
      Alert.alert('Missing fields', 'Username and password are required.');
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        city: form.city,
        role,
      };
      if (role === 'donor') {
        payload.blood_group = form.blood_group;
        if (form.date_of_birth) payload.date_of_birth = form.date_of_birth;
      } else {
        payload.hospital_name = form.hospital_name;
        payload.hospital_address = form.hospital_address;
      }
      await signUp(payload);
    } catch (e: any) {
      const detail = e?.response?.data;
      const msg = typeof detail === 'string' ? detail : JSON.stringify(detail ?? {}, null, 2);
      Alert.alert('Registration failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ padding: 20 }} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>

        <Text style={styles.sectionLabel}>I am registering as:</Text>
        <View style={{ flexDirection: 'row', marginBottom: 16 }}>
          <Chip label="Donor" active={role === 'donor'} onPress={() => setRole('donor')} />
          <Chip label="Hospital" active={role === 'hospital_admin'} onPress={() => setRole('hospital_admin')} />
        </View>

        <TextField label="Username" autoCapitalize="none" value={form.username} onChangeText={set('username')} />
        <TextField label="Email" autoCapitalize="none" keyboardType="email-address" value={form.email} onChangeText={set('email')} />
        <TextField label="Password" secureTextEntry value={form.password} onChangeText={set('password')} />
        <TextField label="First name" value={form.first_name} onChangeText={set('first_name')} />
        <TextField label="Last name" value={form.last_name} onChangeText={set('last_name')} />
        <TextField label="Phone" keyboardType="phone-pad" value={form.phone} onChangeText={set('phone')} />
        <TextField label="City" value={form.city} onChangeText={set('city')} />

        {role === 'donor' ? (
          <>
            <Text style={styles.sectionLabel}>Blood group</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 14 }}>
              {BLOOD_GROUPS.map((g) => (
                <Chip key={g} label={g} active={form.blood_group === g} onPress={() => set('blood_group')(g)} />
              ))}
            </View>
            <TextField label="Date of birth (YYYY-MM-DD)" value={form.date_of_birth} onChangeText={set('date_of_birth')} />
          </>
        ) : (
          <>
            <TextField label="Hospital name" value={form.hospital_name} onChangeText={set('hospital_name')} />
            <TextField label="Hospital address" value={form.hospital_address} onChangeText={set('hospital_address')} />
          </>
        )}

        <Button title="Register" onPress={submit} loading={loading} style={{ marginTop: 8 }} />
        <Button
          title="I already have an account"
          variant="secondary"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 10 }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 16 },
  sectionLabel: { marginBottom: 6, color: colors.text, fontWeight: '600' },
});
