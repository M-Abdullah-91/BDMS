import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

import { fetchMyDonations, fetchMyResponses } from '../../api/endpoints';
import { colors } from '../../theme/colors';

export default function DonorHistoryScreen() {
  const [donations, setDonations] = useState<any[]>([]);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [d, r] = await Promise.all([fetchMyDonations(), fetchMyResponses()]);
      setDonations(d.data.results ?? d.data);
      setResponses(r.data.results ?? r.data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <Text style={styles.h2}>My donations ({donations.length})</Text>
      <FlatList
        data={donations}
        keyExtractor={(i) => String(i.id)}
        ListEmptyComponent={<Text style={styles.muted}>No donations yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.hospital_name}</Text>
            <Text style={styles.body}>{item.units} unit(s) · {item.blood_group}</Text>
            <Text style={styles.muted}>{item.donation_date}</Text>
          </View>
        )}
        style={{ marginBottom: 16 }}
      />

      <Text style={styles.h2}>My offers to help ({responses.length})</Text>
      <FlatList
        data={responses}
        keyExtractor={(i) => String(i.id)}
        ListEmptyComponent={<Text style={styles.muted}>You haven't offered to help with any request yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.body}>Request #{item.request} · {item.status}</Text>
            {item.message ? <Text style={styles.muted}>{item.message}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  h2: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 8 },
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  title: { fontWeight: '700', color: colors.text },
  body: { color: colors.text, marginTop: 2 },
  muted: { color: colors.subtext, marginTop: 2, fontSize: 13 },
});
