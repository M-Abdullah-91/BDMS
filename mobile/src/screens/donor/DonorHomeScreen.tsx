import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { DonorProfile, fetchMatchingRequests, fetchMyDonorProfile } from '../../api/endpoints';
import { colors } from '../../theme/colors';

export default function DonorHomeScreen({ navigation }: any) {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<DonorProfile | null>(null);
  const [matching, setMatching] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [p, r] = await Promise.all([fetchMyDonorProfile(), fetchMatchingRequests()]);
      setProfile(p.data);
      setMatching(r.data.results ?? r.data);
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
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} />}
    >
      <Text style={styles.greeting}>Hello, {user?.first_name || user?.username} 👋</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Blood group</Text>
        <Text style={styles.blood}>{profile?.blood_group}</Text>
        <View style={styles.row}>
          <Badge label={profile?.is_verified ? 'Verified' : 'Pending verification'}
                 color={profile?.is_verified ? colors.success : colors.warning} />
          <Badge label={profile?.is_eligible ? 'Eligible to donate' : 'In cooldown'}
                 color={profile?.is_eligible ? colors.success : colors.danger} />
        </View>
        {!profile?.is_eligible && profile?.days_until_eligible ? (
          <Text style={styles.muted}>Eligible again in {profile.days_until_eligible} day(s) — {profile.next_eligible_date}</Text>
        ) : null}
        {!profile?.is_verified ? (
          <Button
            title="Upload lab report to verify"
            onPress={() => navigation.navigate('Profile', { screen: 'UploadReport' })}
            style={{ marginTop: 14 }}
          />
        ) : null}
      </View>

      <Text style={styles.sectionTitle}>Matching requests near you</Text>
      {matching.length === 0 ? (
        <Text style={styles.muted}>No open requests match your blood group right now.</Text>
      ) : (
        matching.slice(0, 5).map((r) => (
          <View key={r.id} style={styles.card}>
            <Text style={styles.reqTitle}>
              {r.hospital.name} — needs {r.units_needed}× {r.blood_group}
            </Text>
            <Text style={styles.muted}>
              Urgency: {r.urgency} · {r.city || r.hospital.city}
            </Text>
            {r.notes ? <Text style={styles.muted}>{r.notes}</Text> : null}
            <Button
              title="View"
              variant="secondary"
              onPress={() => navigation.navigate('Requests', { screen: 'RequestDetail', params: { id: r.id } })}
              style={{ marginTop: 8 }}
            />
          </View>
        ))
      )}

      <Button title="Sign out" variant="secondary" onPress={signOut} style={{ marginTop: 20 }} />
    </ScrollView>
  );
}

const Badge: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <View style={[badge.wrap, { backgroundColor: color + '22', borderColor: color }]}>
    <Text style={[badge.text, { color }]}>{label}</Text>
  </View>
);

const badge = StyleSheet.create({
  wrap: { paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderRadius: 999, marginRight: 6, marginTop: 6 },
  text: { fontSize: 12, fontWeight: '600' },
});

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 60 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  greeting: { fontSize: 22, fontWeight: '700', color: colors.text, marginBottom: 16 },
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  cardLabel: { color: colors.subtext, marginBottom: 4 },
  blood: { fontSize: 36, fontWeight: '800', color: colors.primary },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 12, marginBottom: 8 },
  reqTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4 },
  muted: { color: colors.subtext, fontSize: 13, marginTop: 4 },
});
