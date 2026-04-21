import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import {
  fetchBloodRequests,
  fetchMyHospital,
  fetchMyInventory,
  fetchPendingReports,
  Hospital,
} from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function HospitalHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [inventoryTotal, setInventoryTotal] = useState(0);
  const [openCount, setOpenCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [h, inv, reqs, pend] = await Promise.all([
        fetchMyHospital(),
        fetchMyInventory(),
        fetchBloodRequests({ status: 'open' }),
        fetchPendingReports(),
      ]);
      setHospital(h.data);
      const invList = inv.data.results ?? inv.data;
      setInventoryTotal(invList.reduce((s: number, i: any) => s + i.units, 0));
      const reqList = reqs.data.results ?? reqs.data;
      setOpenCount(reqList.filter((r: any) => r.hospital.id === h.data.id).length);
      setPendingCount((pend.data.results ?? pend.data).length);
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
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={styles.container}>
      <Text style={styles.hi}>Welcome, {user?.first_name || hospital?.name}</Text>
      <Text style={styles.muted}>{hospital?.name} · {hospital?.city}</Text>

      <View style={styles.grid}>
        <Stat label="Units in stock" value={inventoryTotal} />
        <Stat label="Open requests" value={openCount} />
        <Stat label="Pending lab reports" value={pendingCount} />
      </View>

      <Text style={styles.h2}>Quick actions</Text>
      <Button title="Find verified donors" onPress={() => navigation.navigate('DonorSearch')} />
      <Button title="Review lab reports" variant="secondary" onPress={() => navigation.navigate('PendingReports')} style={{ marginTop: 8 }} />
      <Button title="Record a donation" variant="secondary" onPress={() => navigation.navigate('RecordDonation')} style={{ marginTop: 8 }} />
    </ScrollView>
  );
}

const Stat: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  container: { padding: 16 },
  hi: { fontSize: 22, fontWeight: '700', color: colors.text },
  muted: { color: colors.subtext, marginTop: 2 },
  h2: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 20, marginBottom: 8 },
  grid: { flexDirection: 'row', gap: 8, marginTop: 16, flexWrap: 'wrap' },
  stat: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 26, fontWeight: '800', color: colors.primary },
  statLabel: { color: colors.subtext, marginTop: 2, fontSize: 12 },
});
