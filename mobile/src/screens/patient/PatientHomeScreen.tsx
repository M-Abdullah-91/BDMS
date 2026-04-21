import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { BloodRequest, fetchMyRequests } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function PatientHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [items, setItems] = useState<BloodRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchMyRequests();
      setItems((r.data.results ?? r.data) as BloodRequest[]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const openCount = items.filter((i) => i.status === 'open').length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.hero}>
        <Text style={styles.heroKicker}>YOUR REQUESTS</Text>
        <Text style={styles.heroTitle}>Hello, {user?.first_name || user?.username}</Text>
        <Text style={styles.heroStat}>{openCount} open · {items.length} total</Text>
      </View>

      <View style={{ padding: 16 }}>
        <Button title="+ Post a new blood request" onPress={() => navigation.navigate('Ask')} />
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          contentContainerStyle={{ padding: 16, paddingTop: 0 }}
          data={items}
          keyExtractor={(i) => String(i.id)}
          onRefresh={load}
          refreshing={false}
          ListEmptyComponent={<Text style={styles.empty}>You haven't posted any requests yet.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.card} onPress={() => navigation.navigate('RequestDetail', { id: item.id })}>
              <View style={styles.cardHead}>
                <Text style={styles.bgBadge}>{item.blood_group}</Text>
                <StatusPill status={item.status} />
              </View>
              <Text style={styles.title}>{item.patient_name || 'For me'}</Text>
              <Text style={styles.meta}>
                {item.units_needed} unit(s) · {item.urgency} · {item.city || 'any city'}
              </Text>
              <Text style={styles.meta}>{item.response_count} donor(s) offered to help</Text>
              {item.hospital ? (
                <Text style={styles.meta}>At {item.hospital.name}</Text>
              ) : (
                <Text style={styles.meta}>No hospital attached</Text>
              )}
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const color =
    status === 'open' ? colors.primary : status === 'fulfilled' ? colors.success : colors.muted;
  return (
    <View style={[pill.wrap, { borderColor: color, backgroundColor: color + '15' }]}>
      <Text style={[pill.text, { color }]}>{status}</Text>
    </View>
  );
};

const pill = StyleSheet.create({
  wrap: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  text: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
});

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  heroStat: { color: 'rgba(255,255,255,0.9)', marginTop: 2, fontSize: 13 },

  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bgBadge: {
    backgroundColor: colors.blush,
    color: colors.primaryDark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    fontWeight: '800',
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.text },
  meta: { color: colors.subtext, fontSize: 13, marginTop: 2 },
  empty: { color: colors.subtext, textAlign: 'center', marginTop: 40 },
});
