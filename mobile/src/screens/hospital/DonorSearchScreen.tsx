import React, { useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import { TextField } from '../../components/TextField';
import { searchDonors } from '../../api/endpoints';
import { BLOOD_GROUPS, colors } from '../../theme/colors';

export default function DonorSearchScreen() {
  const [group, setGroup] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (group) params.blood_group = group;
      if (city) params.user__city = city;
      const r = await searchDonors(params);
      setResults(r.data.results ?? r.data);
      setHasSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <Text style={styles.label}>Blood group</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {BLOOD_GROUPS.map((g) => (
          <Chip key={g} label={g} active={group === g} onPress={() => setGroup(group === g ? null : g)} />
        ))}
      </View>
      <TextField label="City" value={city} onChangeText={setCity} />
      <Button title="Search" onPress={run} loading={loading} />

      {loading ? null : (
        <FlatList
          style={{ marginTop: 16 }}
          data={results}
          keyExtractor={(i) => String(i.id)}
          ListEmptyComponent={hasSearched ? <Text style={styles.muted}>No verified donors match.</Text> : null}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.title}>{item.full_name} · {item.blood_group}</Text>
              <Text style={styles.muted}>{item.city} · 📞 {item.phone || 'no phone'}</Text>
              <Text style={styles.muted}>
                {item.is_eligible ? '✓ Eligible now' : `⏳ Eligible on ${item.next_eligible_date}`}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: '600', marginBottom: 6 },
  muted: { color: colors.subtext, marginTop: 2, fontSize: 13 },
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  title: { fontWeight: '700', color: colors.text },
});
