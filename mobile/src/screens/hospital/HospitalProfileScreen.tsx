import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import {
  fetchHospitalDonations,
  fetchMyHospital,
  updateMe,
  updateMyHospital,
} from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function HospitalProfileScreen() {
  const { user, signOut, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [license, setLicense] = useState('');
  const [donations, setDonations] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const [h, d] = await Promise.all([fetchMyHospital(), fetchHospitalDonations()]);
    setName(h.data.name);
    setAddress(h.data.address ?? '');
    setCity(h.data.city);
    setPhone(h.data.phone);
    setLicense(h.data.license_number ?? '');
    setDonations(d.data.results ?? d.data);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const save = async () => {
    setSaving(true);
    try {
      await updateMyHospital({ name, address, city, phone, license_number: license } as any);
      await updateMe({ city, phone });
      await refreshUser();
      Alert.alert('Saved', 'Hospital profile updated.');
    } catch (e: any) {
      Alert.alert('Error', JSON.stringify(e?.response?.data ?? e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.h1}>Hospital Profile</Text>
      <Text style={styles.muted}>Signed in as @{user?.username}</Text>

      <View style={styles.card}>
        <TextField label="Hospital name" value={name} onChangeText={setName} />
        <TextField label="Address" value={address} onChangeText={setAddress} />
        <TextField label="City" value={city} onChangeText={setCity} />
        <TextField label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextField label="License #" value={license} onChangeText={setLicense} />
        <Button title="Save" onPress={save} loading={saving} />
      </View>

      <Text style={styles.h2}>Recorded donations ({donations.length})</Text>
      {donations.slice(0, 10).map((d) => (
        <View key={d.id} style={styles.card}>
          <Text style={styles.b}>{d.donor_name} · {d.blood_group}</Text>
          <Text style={styles.muted}>{d.units} unit(s) · {d.donation_date}</Text>
        </View>
      ))}

      <Button title="Sign out" variant="danger" onPress={signOut} style={{ marginTop: 12 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '700', color: colors.text },
  h2: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 18, marginBottom: 8 },
  muted: { color: colors.subtext, marginTop: 2, fontSize: 13 },
  b: { fontWeight: '700', color: colors.text },
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 10,
  },
});
