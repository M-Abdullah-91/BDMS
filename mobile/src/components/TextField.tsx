import React from 'react';
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '../theme/colors';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export const TextField: React.FC<Props> = ({ label, error, style, ...rest }) => (
  <View style={styles.wrap}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      placeholderTextColor={colors.subtext}
      style={[styles.input, error ? styles.inputError : null, style]}
      {...rest}
    />
    {!!error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { marginBottom: 6, color: colors.text, fontWeight: '600' },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  inputError: { borderColor: colors.danger },
  error: { marginTop: 4, color: colors.danger, fontSize: 12 },
});
