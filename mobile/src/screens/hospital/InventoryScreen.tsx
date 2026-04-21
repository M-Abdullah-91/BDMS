import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '../../components/Button';
import { Chip } from '../../components/Chip';
import {
  createInventoryItem,
  deleteInventoryItem,
  fetchMyInventory,
  updateInventoryItem,
} from '../../api/endpoints';
import { BLOOD_GROUPS, colors } from '../../theme/colors';

export default function InventoryScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [newGroup, setNewGroup] = useState('O+');
  const [newUnits, setNewUnits] = useState('0');

  const load = async () => {
    const r = await fetchMyInventory();
    setItems(r.data.results ?? r.data);
  };

  useFocusEffect(
    useCallback(() => {
      load();
    }, []),
  );

  const add = async () => {
    try {
      await createInventoryItem({ blood_group: newGroup, units: parseInt(newUnits, 10) || 0 });
      setNewUnits('0');
      load();
    } catch (e: any) {
      Alert.alert('Error', JSON.stringify(e?.response?.data ?? e.message));
    }
  };

  const save = async (id: number, units: string) => {
    try {
      await updateInventoryItem(id, { units: parseInt(units, 10) || 0 });
      load();
    } catch (e: any) {
      Alert.alert('Error', JSON.stringify(e?.response?.data ?? e.message));
    }
  };

  const remove = async (id: number) => {
    await deleteInventoryItem(id);
    load();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <Text style={styles.h2}>Add new inventory row</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
        {BLOOD_GROUPS.map((g) => (
          <Chip key={g} label={g} active={newGroup === g} onPress={() => setNewGroup(g)} />
        ))}
      </View>
      <View style={styles.row}>
        <TextInput
          keyboardType="number-pad"
          style={styles.input}
          value={newUnits}
          onChangeText={setNewUnits}
        />
        <Button title="Add" onPress={add} style={{ flex: 1 }} />
      </View>

      <Text style={styles.h2}>Current stock</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => String(i.id)}
        ListEmptyComponent={<Text style={styles.muted}>No inventory yet.</Text>}
        renderItem={({ item }) => <InventoryRow item={item} onSave={save} onDelete={remove} />}
      />
    </View>
  );
}

const InventoryRow: React.FC<{ item: any; onSave: (id: number, u: string) => void; onDelete: (id: number) => void }> = ({
  item,
  onSave,
  onDelete,
}) => {
  const [v, setV] = useState(String(item.units));
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{item.blood_group}</Text>
      <TextInput keyboardType="number-pad" style={styles.input} value={v} onChangeText={setV} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title="Save" onPress={() => onSave(item.id, v)} style={{ flex: 1 }} />
        <Button title="Delete" variant="danger" onPress={() => onDelete(item.id)} style={{ flex: 1 }} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  h2: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 8, marginBottom: 6 },
  muted: { color: colors.subtext, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  card: {
    backgroundColor: colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10,
    gap: 8,
  },
  title: { fontWeight: '800', color: colors.primary, fontSize: 18 },
});
