import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { TextField } from '../../components/TextField';
import { recordDonation, searchDonors } from '../../api/endpoints';
import { BLOOD_GROUPS, colors } from '../../theme/colors';

export default function RecordDonationScreen() {
  const [donorId, setDonorId] = useState('');
  const [units, setUnits] = useState('1');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [lookup, setLookup] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  const search = async () => {
    const params: Record<string, string> = {};
    if (query) params.search = query;
    const r = await searchDonors(params);
    setLookup(r.data.results ?? r.data);
  };

  const submit = async () => {
    if (!donorId) {
      Alert.alert('Missing donor', 'Enter or pick a donor ID.');
      return;
    }
    setSaving(true);
    try {
      await recordDonation({
        donor_id: parseInt(donorId, 10),
        blood_group: bloodGroup,
        units: parseInt(units, 10) || 1,
        donation_date: date,
        notes,
      });
      Alert.alert('Recorded', 'Donation saved and donor cooldown started.');
      setDonorId('');
      setUnits('1');
      setNotes('');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || JSON.stringify(e?.response?.data ?? e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Find donor</Text>
      <TextField label="Search by name/username" value={query} onChangeText={setQuery} />
      <Button title="Search verified donors" variant="secondary" onPress={search} />
      {lookup.slice(0, 5).map((d) => (
        <View key={d.id} style={styles.lookupRow}>
          <Text style={{ color: colors.text }}>
            #{d.id} · {d.full_name} · {d.blood_group}
          </Text>
          <Button
            title="Pick"
            variant="secondary"
            onPress={() => {
              setDonorId(String(d.id));
              setBloodGroup(d.blood_group);
            }}
          />
        </View>
      ))}

      <Text style={[styles.label, { marginTop: 16 }]}>Donation details</Text>
      <TextField label="Donor ID" keyboardType="number-pad" value={donorId} onChangeText={setDonorId} />

      <Text style={styles.label}>Blood group</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 }}>
        {BLOOD_GROUPS.map((g) => (
          <Chip key={g} label={g} active={bloodGroup === g} onPress={() => setBloodGroup(g)} />
        ))}
      </View>

      <TextField label="Units" keyboardType="number-pad" value={units} onChangeText={setUnits} />
      <TextField label="Donation date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
      <TextField label="Notes" value={notes} onChangeText={setNotes} />

      <Button title="Record donation" onPress={submit} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: '600', marginBottom: 6 },
  lookupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 6,
  },
});
