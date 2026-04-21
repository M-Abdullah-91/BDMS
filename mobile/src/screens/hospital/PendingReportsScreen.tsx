import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator, Alert, FlatList, Linking, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';

import { Button } from '../../components/Button';
import { fetchPendingReports, reviewReport } from '../../api/endpoints';
import { colors } from '../../theme/colors';

export default function PendingReportsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const apiBaseUrl: string = (Constants.expoConfig?.extra as any)?.apiBaseUrl ?? '';
  const mediaRoot = apiBaseUrl.replace(/\/api$/, '');

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetchPendingReports();
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

  const act = async (id: number, action: 'approve' | 'reject') => {
    try {
      await reviewReport(id, action);
      Alert.alert('Done', action === 'approve' ? 'Donor verified.' : 'Report rejected.');
      load();
    } catch (e: any) {
      Alert.alert('Error', JSON.stringify(e?.response?.data ?? e.message));
    }
  };

  const open = (file: string) => {
    const url = file.startsWith('http') ? file : `${mediaRoot}${file}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16 }}
      data={items}
      keyExtractor={(i) => String(i.id)}
      onRefresh={load}
      refreshing={false}
      ListEmptyComponent={<Text style={styles.muted}>No reports pending review.</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <Text style={styles.title}>Donor #{item.donor}</Text>
          {item.note ? <Text style={styles.muted}>"{item.note}"</Text> : null}
          <Text style={styles.muted}>Uploaded {item.uploaded_at?.slice(0, 10)}</Text>
          <Button title="Open file" variant="secondary" onPress={() => open(item.file)} style={{ marginTop: 8 }} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
            <Button title="Approve" onPress={() => act(item.id, 'approve')} style={{ flex: 1 }} />
            <Button title="Reject" variant="danger" onPress={() => act(item.id, 'reject')} style={{ flex: 1 }} />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  muted: { color: colors.subtext, fontSize: 13, marginTop: 2 },
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
