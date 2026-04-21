import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { fetchBloodRequests, fetchMatchingRequests } from '../../api/endpoints';
import { Chip } from '../../components/Chip';
import { colors } from '../../theme/colors';

export default function DonorRequestsScreen({ navigation }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [onlyMatching, setOnlyMatching] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const resp = onlyMatching ? await fetchMatchingRequests() : await fetchBloodRequests({ status: 'open' });
      setItems(resp.data.results ?? resp.data);
    } finally {
      setLoading(false);
    }
  }, [onlyMatching]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <View style={{ flexDirection: 'row', marginBottom: 12 }}>
        <Chip label="Matching my group" active={onlyMatching} onPress={() => setOnlyMatching(true)} />
        <Chip label="All open" active={!onlyMatching} onPress={() => setOnlyMatching(false)} />
      </View>
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => String(i.id)}
          onRefresh={load}
          refreshing={false}
          ListEmptyComponent={<Text style={styles.empty}>No open requests.</Text>}
          renderItem={({ item }) => (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('RequestDetail', { id: item.id })}
            >
              <Text style={styles.title}>{item.hospital.name}</Text>
              <Text style={styles.body}>
                Needs {item.units_needed}× {item.blood_group} · {item.urgency}
              </Text>
              <Text style={styles.muted}>{item.city || item.hospital.city}</Text>
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
  body: { color: colors.text, marginTop: 4 },
  muted: { color: colors.subtext, marginTop: 2, fontSize: 13 },
  empty: { color: colors.subtext, textAlign: 'center', marginTop: 40 },
});
