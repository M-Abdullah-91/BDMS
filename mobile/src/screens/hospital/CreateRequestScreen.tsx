import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { TextField } from '../../components/TextField';
import { createBloodRequest } from '../../api/endpoints';
import { BLOOD_GROUPS, colors } from '../../theme/colors';

const URGENCIES = ['low', 'normal', 'high', 'critical'] as const;

export default function CreateRequestScreen({ navigation }: any) {
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [units, setUnits] = useState('1');
  const [patient, setPatient] = useState('');
  const [urgency, setUrgency] = useState<(typeof URGENCIES)[number]>('normal');
  const [notes, setNotes] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

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
      } as any);
      Alert.alert('Created', 'Your blood request has been posted.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', JSON.stringify(e?.response?.data ?? e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Blood group</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {BLOOD_GROUPS.map((g) => (
          <Chip key={g} label={g} active={bloodGroup === g} onPress={() => setBloodGroup(g)} />
        ))}
      </View>

      <TextField label="Units needed" keyboardType="number-pad" value={units} onChangeText={setUnits} />
      <TextField label="Patient name" value={patient} onChangeText={setPatient} />
      <TextField label="City (optional — defaults to hospital city)" value={city} onChangeText={setCity} />

      <Text style={styles.label}>Urgency</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {URGENCIES.map((u) => (
          <Chip key={u} label={u} active={urgency === u} onPress={() => setUrgency(u)} />
        ))}
      </View>

      <TextField label="Notes" value={notes} onChangeText={setNotes} multiline />
      <Button title="Post request" onPress={submit} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: '600', marginBottom: 6 },
});
