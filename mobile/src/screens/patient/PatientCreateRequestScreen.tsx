import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { TextField } from '../../components/TextField';
import { createBloodRequest, Hospital, listHospitals } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS, colors } from '../../theme/colors';

const URGENCIES = ['low', 'normal', 'high', 'critical'] as const;

export default function PatientCreateRequestScreen({ navigation }: any) {
  const { user } = useAuth();
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [units, setUnits] = useState('1');
  const [patient, setPatient] = useState(user?.first_name || '');
  const [urgency, setUrgency] = useState<(typeof URGENCIES)[number]>('normal');
  const [notes, setNotes] = useState('');
  const [city, setCity] = useState(user?.city || '');
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const loadHospitals = async () => {
    const r = await listHospitals();
    setHospitals((r.data.results ?? r.data) as Hospital[]);
  };

  useFocusEffect(
    useCallback(() => {
      loadHospitals();
    }, []),
  );

  const submit = async () => {
    if (!patient) {
      Alert.alert('Missing field', 'Enter a patient name.');
      return;
    }
    setSaving(true);
    try {
      await createBloodRequest({
        blood_group: bloodGroup,
        units_needed: parseInt(units, 10) || 1,
        patient_name: patient,
        urgency,
        notes,
        city,
        hospital_id: hospitalId,
      });
      Alert.alert('Posted', 'Your request is live. Matching donors will see it.');
      navigation.navigate('Home');
    } catch (e: any) {
      Alert.alert('Error', JSON.stringify(e?.response?.data ?? e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Post a blood request</Text>
        <Text style={styles.bannerBody}>
          Verified donors in your city with the matching blood group will see this
          immediately. You can attach a hospital if you already have one.
        </Text>
      </View>

      <Text style={styles.label}>Blood group needed</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {BLOOD_GROUPS.map((g) => (
          <Chip key={g} label={g} active={bloodGroup === g} onPress={() => setBloodGroup(g)} />
        ))}
      </View>

      <TextField label="Units needed" keyboardType="number-pad" value={units} onChangeText={setUnits} />
      <TextField label="Patient name" value={patient} onChangeText={setPatient} />
      <TextField label="City" value={city} onChangeText={setCity} placeholder="Karachi" />

      <Text style={styles.label}>Urgency</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {URGENCIES.map((u) => (
          <Chip key={u} label={u} active={urgency === u} onPress={() => setUrgency(u)} />
        ))}
      </View>

      <Text style={styles.label}>Hospital (optional)</Text>
      <Text style={styles.sub}>Pick one if you're going to a specific hospital. Leave blank to crowdsource.</Text>
      <View style={styles.hospitalList}>
        <Pressable
          style={[styles.hospitalRow, hospitalId === null && styles.hospitalRowActive]}
          onPress={() => setHospitalId(null)}
        >
          <Text style={[styles.hospitalName, hospitalId === null && styles.hospitalNameActive]}>
            No hospital attached
          </Text>
          <Text style={styles.hospitalCity}>Anyone can respond</Text>
        </Pressable>
        {hospitals.map((h) => (
          <Pressable
            key={h.id}
            style={[styles.hospitalRow, hospitalId === h.id && styles.hospitalRowActive]}
            onPress={() => setHospitalId(h.id)}
          >
            <Text style={[styles.hospitalName, hospitalId === h.id && styles.hospitalNameActive]}>
              {h.name}
            </Text>
            <Text style={styles.hospitalCity}>{h.city}</Text>
          </Pressable>
        ))}
      </View>

      <TextField label="Additional notes" value={notes} onChangeText={setNotes} multiline />
      <Button title="Post request" onPress={submit} loading={saving} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.blush,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  bannerTitle: { color: colors.primaryDark, fontWeight: '800', fontSize: 16 },
  bannerBody: { color: colors.primaryDark, marginTop: 4, fontSize: 13, lineHeight: 18 },

  label: { color: colors.primaryDark, fontWeight: '800', marginBottom: 6, letterSpacing: 0.3 },
  sub: { color: colors.subtext, fontSize: 12, marginBottom: 8 },

  hospitalList: { marginBottom: 14 },
  hospitalRow: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: 8,
  },
  hospitalRowActive: {
    borderColor: colors.primary,
    backgroundColor: colors.blush,
  },
  hospitalName: { color: colors.text, fontWeight: '700' },
  hospitalNameActive: { color: colors.primaryDark },
  hospitalCity: { color: colors.subtext, fontSize: 12, marginTop: 2 },
});
