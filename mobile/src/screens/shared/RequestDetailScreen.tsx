import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import {
  fetchBloodRequest,
  fetchRequestResponses,
  respondToRequest,
  updateRequestStatus,
} from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function RequestDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { user } = useAuth();
  const [item, setItem] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchBloodRequest(id);
      setItem(r.data);
      if (user?.role === 'hospital_admin') {
        try {
          const rr = await fetchRequestResponses(id);
          setResponses(rr.data.results ?? rr.data);
        } catch {
          /* not our request */
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, [id]),
  );

  if (loading || !item) {
    return (
      <View style={styles.center}>
        {loading ? <ActivityIndicator color={colors.primary} /> : <Text>Not found.</Text>}
      </View>
    );
  }

  const offer = async () => {
    setActioning(true);
    try {
      await respondToRequest(item.id);
      Alert.alert('Thank you!', 'Your offer has been sent to the hospital.');
      load();
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.detail || 'Could not respond.');
    } finally {
      setActioning(false);
    }
  };

  const mark = async (s: string) => {
    setActioning(true);
    try {
      await updateRequestStatus(item.id, s);
      load();
    } finally {
      setActioning(false);
    }
  };

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.h1}>{item.hospital.name}</Text>
      <Text style={styles.muted}>{item.city || item.hospital.city} · {item.hospital.phone}</Text>

      <View style={styles.card}>
        <Text style={styles.row}>Patient: <Text style={styles.b}>{item.patient_name}</Text></Text>
        <Text style={styles.row}>Needs: <Text style={styles.b}>{item.units_needed}× {item.blood_group}</Text></Text>
        <Text style={styles.row}>Urgency: <Text style={styles.b}>{item.urgency}</Text></Text>
        <Text style={styles.row}>Status: <Text style={styles.b}>{item.status}</Text></Text>
        {item.needed_by ? <Text style={styles.row}>Needed by: {item.needed_by.slice(0, 10)}</Text> : null}
        {item.notes ? <Text style={styles.row}>Notes: {item.notes}</Text> : null}
      </View>

      {user?.role === 'donor' && item.status === 'open' ? (
        <Button title="I can help — offer to donate" onPress={offer} loading={actioning} />
      ) : null}

      {user?.role === 'hospital_admin' && item.status === 'open' ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button title="Mark fulfilled" onPress={() => mark('fulfilled')} loading={actioning} style={{ flex: 1 }} />
          <Button title="Cancel" variant="danger" onPress={() => mark('cancelled')} loading={actioning} style={{ flex: 1 }} />
        </View>
      ) : null}

      {user?.role === 'hospital_admin' ? (
        <>
          <Text style={styles.h2}>Responders ({responses.length})</Text>
          {responses.length === 0 ? (
            <Text style={styles.muted}>No one has offered to help yet.</Text>
          ) : (
            responses.map((r) => (
              <View key={r.id} style={styles.card}>
                <Text style={styles.b}>{r.donor_name} · {r.donor_blood_group ?? '—'}</Text>
                <Text style={styles.muted}>📞 {r.donor_phone || 'no phone'}</Text>
                {r.message ? <Text style={styles.muted}>"{r.message}"</Text> : null}
              </View>
            ))
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  h1: { fontSize: 22, fontWeight: '700', color: colors.text },
  h2: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 16, marginBottom: 8 },
  muted: { color: colors.subtext, marginTop: 2, fontSize: 13 },
  row: { color: colors.text, marginBottom: 4 },
  b: { fontWeight: '700' },
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: 10,
  },
});
