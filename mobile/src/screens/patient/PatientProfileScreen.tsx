import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { updateMe } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function PatientProfileScreen() {
  const { user, refreshUser, signOut } = useAuth();
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateMe({
        first_name: firstName,
        last_name: lastName,
        phone,
        city,
      } as any);
      await refreshUser();
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch (e: any) {
      Alert.alert('Error', JSON.stringify(e?.response?.data ?? e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>
            {(user?.first_name?.[0] || user?.username?.[0] || '?').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.heroName}>{user?.first_name} {user?.last_name}</Text>
        <Text style={styles.heroMeta}>@{user?.username} · patient</Text>
      </View>

      <Text style={styles.label}>My details</Text>
      <View style={styles.card}>
        <TextField label="First name" value={firstName} onChangeText={setFirstName} />
        <TextField label="Last name" value={lastName} onChangeText={setLastName} />
        <TextField label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextField label="City" value={city} onChangeText={setCity} />
        <Button title="Save changes" onPress={save} loading={saving} />
      </View>

      <Button title="Sign out" variant="danger" onPress={signOut} style={{ marginTop: 16 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarInitial: { color: '#fff', fontSize: 28, fontWeight: '800' },
  heroName: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroMeta: { color: 'rgba(255,255,255,0.85)', marginTop: 2 },

  label: { color: colors.primaryDark, fontWeight: '800', marginBottom: 8, letterSpacing: 0.3 },
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
