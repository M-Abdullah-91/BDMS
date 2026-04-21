import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { TextField } from '../../components/TextField';
import {
  DonorProfile,
  fetchMyDonorProfile,
  updateMe,
  updateMyDonorProfile,
} from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS, colors } from '../../theme/colors';

export default function DonorProfileScreen({ navigation }: any) {
  const { user, refreshUser, signOut } = useAuth();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [weight, setWeight] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [available, setAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const p = await fetchMyDonorProfile();
    setProfile(p.data);
    setBloodGroup(p.data.blood_group);
    setAvailable(p.data.available);
    setWeight(p.data.weight_kg ? String(p.data.weight_kg) : '');
    setCity(user?.city || '');
    setPhone(user?.phone || '');
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const save = async () => {
    setSaving(true);
    try {
      await updateMe({ city, phone });
      await updateMyDonorProfile({
        blood_group: bloodGroup,
        available,
        weight_kg: weight ? parseInt(weight, 10) : null,
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
      <Text style={styles.h1}>My Profile</Text>
      <Text style={styles.muted}>@{user?.username}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Blood group</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          {BLOOD_GROUPS.map((g) => (
            <Chip key={g} label={g} active={bloodGroup === g} onPress={() => setBloodGroup(g)} />
          ))}
        </View>

        <TextField label="City" value={city} onChangeText={setCity} />
        <TextField label="Phone" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
        <TextField label="Weight (kg)" keyboardType="number-pad" value={weight} onChangeText={setWeight} />

        <View style={styles.row}>
          <Text style={{ color: colors.text, fontWeight: '600' }}>Available to donate</Text>
          <Switch value={available} onValueChange={setAvailable} />
        </View>

        <Button title="Save changes" onPress={save} loading={saving} style={{ marginTop: 10 }} />
      </View>

      <Text style={styles.h2}>Verification</Text>
      {profile?.is_verified ? (
        <Text style={styles.success}>✓ Your blood group is verified.</Text>
      ) : (
        <Text style={styles.muted}>
          You must upload a lab report and wait for a hospital admin to verify your blood group
          before your profile becomes visible to hospitals.
        </Text>
      )}
      <Button
        title="Upload Lab Report"
        variant="secondary"
        onPress={() => navigation.navigate('UploadReport')}
        style={{ marginTop: 10 }}
      />

      <Button title="Sign out" variant="danger" onPress={signOut} style={{ marginTop: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 22, fontWeight: '700', color: colors.text },
  h2: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 6 },
  muted: { color: colors.subtext, marginTop: 4 },
  label: { color: colors.text, fontWeight: '600', marginBottom: 6 },
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 14,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  success: { color: colors.success, fontWeight: '600', marginTop: 4 },
});
