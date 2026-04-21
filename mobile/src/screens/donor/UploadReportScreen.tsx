import * as DocumentPicker from 'expo-document-picker';
import React, { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { fetchMyLabReports, uploadLabReport } from '../../api/endpoints';
import { colors } from '../../theme/colors';

type Picked = { uri: string; name: string; mimeType?: string } | null;

export default function UploadReportScreen() {
  const [file, setFile] = useState<Picked>(null);
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [reports, setReports] = useState<any[]>([]);

  const loadReports = async () => {
    const r = await fetchMyLabReports();
    setReports(r.data.results ?? r.data);
  };

  useFocusEffect(
    useCallback(() => {
      loadReports();
    }, []),
  );

  const pick = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: ['image/*', 'application/pdf'],
      copyToCacheDirectory: true,
    });
    if (res.canceled || !res.assets?.length) return;
    const a = res.assets[0];
    setFile({ uri: a.uri, name: a.name, mimeType: a.mimeType });
  };

  const submit = async () => {
    if (!file) {
      Alert.alert('No file', 'Pick a lab report first.');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType || 'application/octet-stream',
      } as any);
      if (note) form.append('note', note);
      await uploadLabReport(form);
      Alert.alert('Uploaded', 'Your report is pending review.');
      setFile(null);
      setNote('');
      loadReports();
    } catch (e: any) {
      Alert.alert('Upload failed', JSON.stringify(e?.response?.data ?? e.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <Text style={styles.label}>Pick a lab report (PDF or image):</Text>
      <Button title={file ? `Selected: ${file.name}` : 'Choose file'} variant="secondary" onPress={pick} />
      <TextField label="Note (optional)" value={note} onChangeText={setNote} style={{ marginTop: 12 }} />
      <Button title="Upload" onPress={submit} loading={uploading} style={{ marginTop: 8 }} />

      <Text style={styles.h2}>My submitted reports</Text>
      <FlatList
        data={reports}
        keyExtractor={(i) => String(i.id)}
        ListEmptyComponent={<Text style={styles.muted}>No reports submitted yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>Status: {item.status}</Text>
            <Text style={styles.muted}>Uploaded {item.uploaded_at?.slice(0, 10)}</Text>
            {item.review_note ? <Text style={styles.muted}>Note: {item.review_note}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: '600', marginBottom: 8 },
  h2: { fontSize: 16, fontWeight: '700', color: colors.text, marginTop: 18, marginBottom: 8 },
  muted: { color: colors.subtext, marginTop: 2, fontSize: 13 },
  card: {
    backgroundColor: colors.card,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  title: { fontWeight: '700', color: colors.text },
});
