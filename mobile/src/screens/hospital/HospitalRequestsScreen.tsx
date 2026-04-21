import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { fetchBloodRequests, fetchMyHospital } from '../../api/endpoints';
import { colors } from '../../theme/colors';

export default function HospitalRequestsScreen({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const h = await fetchMyHospital();
      const r = await fetchBloodRequests({ hospital: String(h.data.id) });
      setItems(r.data.results ?? r.data);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <Button title="+ New blood request" onPress={() => navigation.navigate('CreateRequest')} />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          style={{ marginTop: 16 }}
          data={items}
          keyExtractor={(i) => String(i.id)}
          onRefresh={load}
          refreshing={false}
          ListEmptyComponent={<Text style={styles.muted}>You haven't created any requests yet.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('RequestDetail', { id: item.id })}
            >
              <Text style={styles.title}>{item.units_needed}× {item.blood_group} · {item.urgency}</Text>
              <Text style={styles.muted}>{item.patient_name} · {item.status}</Text>
              <Text style={styles.muted}>Responders: {item.response_count}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
  },
  title: { fontWeight: '700', color: colors.text, fontSize: 15 },
  muted: { color: colors.subtext, fontSize: 13, marginTop: 2 },
});
