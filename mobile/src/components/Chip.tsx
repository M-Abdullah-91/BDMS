import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors } from '../theme/colors';

interface Props {
  label: string;
  active?: boolean;
  onPress?: () => void;
}

export const Chip: React.FC<Props> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, active ? styles.active : null]}
  >
    <Text style={[styles.text, active ? styles.activeText : null]}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 6,
    marginBottom: 6,
    backgroundColor: colors.card,
  },
  active: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { color: colors.text, fontSize: 13 },
  activeText: { color: '#fff', fontWeight: '600' },
});
