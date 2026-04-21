import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_GROUPS, colors } from '../../theme/colors';

type Role = 'donor' | 'hospital_admin' | 'patient';

export default function RegisterScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [role, setRole] = useState<Role>('donor');
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    city: '',
    blood_group: 'O+',
    date_of_birth: '',
    hospital_name: '',
    hospital_address: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (key: string) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async () => {
    if (!form.username || !form.password) {
      Alert.alert('Missing fields', 'Username and password are required.');
      return;
    }
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        city: form.city,
        role,
      };
      if (role === 'donor') {
        payload.blood_group = form.blood_group;
        if (form.date_of_birth) payload.date_of_birth = form.date_of_birth;
      } else {
        payload.hospital_name = form.hospital_name;
        payload.hospital_address = form.hospital_address;
      }
      await signUp(payload);
    } catch (e: any) {
      const detail = e?.response?.data;
      const msg =
        typeof detail === 'string'
          ? detail
          : JSON.stringify(detail ?? {}, null, 2);
      Alert.alert('Registration failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Red hero */}
        <View style={styles.hero}>
          <View style={styles.heroGlow} />
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>♥</Text>
          </View>
          <Text style={styles.heroKicker}>VITALSTREAM</Text>
          <Text style={styles.heroTitle}>Join the lifeline.</Text>
          <Text style={styles.heroSubtitle}>
            Become part of a verified donor network that hospitals trust.
          </Text>
        </View>

        {/* Form card — overlaps the hero */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>I'm signing up as</Text>
          <View style={styles.roleRow}>
            <RoleCard
              glyph="🩸"
              label="Donor"
              hint="Donate & save lives."
              active={role === 'donor'}
              onPress={() => setRole('donor')}
            />
            <RoleCard
              glyph="🏥"
              label="Hospital"
              hint="Manage donors & stock."
              active={role === 'hospital_admin'}
              onPress={() => setRole('hospital_admin')}
            />
            <RoleCard
              glyph="🤒"
              label="Patient"
              hint="Request blood directly."
              active={role === 'patient'}
              onPress={() => setRole('patient')}
            />
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Your account</Text>
          <TextField
            label="Username"
            autoCapitalize="none"
            value={form.username}
            onChangeText={set('username')}
            placeholder="e.g. abdullah.khan"
          />
          <TextField
            label="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={set('email')}
            placeholder="you@example.com"
          />
          <TextField
            label="Password"
            secureTextEntry
            value={form.password}
            onChangeText={set('password')}
            placeholder="at least 6 characters"
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 6 }}>
              <TextField
                label="First name"
                value={form.first_name}
                onChangeText={set('first_name')}
              />
            </View>
            <View style={{ flex: 1, marginLeft: 6 }}>
              <TextField
                label="Last name"
                value={form.last_name}
                onChangeText={set('last_name')}
              />
            </View>
          </View>
          <TextField
            label="Phone"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={set('phone')}
            placeholder="+92 3XX XXXXXXX"
          />
          <TextField
            label="City"
            value={form.city}
            onChangeText={set('city')}
            placeholder="Karachi"
          />

          {role === 'donor' ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Blood group</Text>
              <Text style={styles.helperText}>
                Hospitals will verify this before your profile becomes visible.
              </Text>
              <View style={styles.bloodGrid}>
                {BLOOD_GROUPS.map((g) => (
                  <BloodChip
                    key={g}
                    label={g}
                    active={form.blood_group === g}
                    onPress={() => set('blood_group')(g)}
                  />
                ))}
              </View>
              <TextField
                label="Date of birth (optional)"
                value={form.date_of_birth}
                onChangeText={set('date_of_birth')}
                placeholder="YYYY-MM-DD"
              />
            </>
          ) : (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>Hospital details</Text>
              <TextField
                label="Hospital name"
                value={form.hospital_name}
                onChangeText={set('hospital_name')}
                placeholder="e.g. Aga Khan University Hospital"
              />
              <TextField
                label="Hospital address"
                value={form.hospital_address}
                onChangeText={set('hospital_address')}
                placeholder="Street, area, city"
              />
            </>
          )}

          <Button
            title={loading ? 'Creating account…' : 'Create my account'}
            onPress={submit}
            loading={loading}
            style={styles.cta}
          />

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.footerLink}
          >
            <Text style={styles.footerText}>
              Already have an account? <Text style={styles.footerAccent}>Sign in</Text>
            </Text>
          </Pressable>
        </View>

        <Text style={styles.fineprint}>
          By continuing you agree that your verified blood group will be visible
          to partner hospitals when a request matches your profile.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ----------------------------- Sub-components ----------------------------- */

const RoleCard: React.FC<{
  glyph: string;
  label: string;
  hint: string;
  active: boolean;
  onPress: () => void;
}> = ({ glyph, label, hint, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[roleCard.wrap, active && roleCard.active]}
  >
    <View style={[roleCard.iconBubble, active && roleCard.iconBubbleActive]}>
      <Text style={roleCard.glyph}>{glyph}</Text>
    </View>
    <Text style={[roleCard.label, active && roleCard.labelActive]}>{label}</Text>
    <Text style={[roleCard.hint, active && roleCard.hintActive]}>{hint}</Text>
  </Pressable>
);

const BloodChip: React.FC<{
  label: string;
  active: boolean;
  onPress: () => void;
}> = ({ label, active, onPress }) => (
  <Pressable
    onPress={onPress}
    style={[bloodChip.wrap, active && bloodChip.active]}
  >
    <Text style={[bloodChip.text, active && bloodChip.textActive]}>{label}</Text>
  </Pressable>
);

/* --------------------------------- Styles --------------------------------- */

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
    backgroundColor: colors.bg,
  },

  // Hero
  hero: {
    backgroundColor: colors.primary,
    paddingTop: 64,
    paddingBottom: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: colors.accent,
    opacity: 0.35,
    top: -120,
    right: -80,
  },
  heroBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  heroKicker: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 6,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 20,
  },

  // Card
  card: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: -44, // overlaps hero
    padding: 22,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 6,
  },

  sectionTitle: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 15,
    marginBottom: 10,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  helperText: {
    color: colors.subtext,
    fontSize: 12,
    marginBottom: 10,
    marginTop: -4,
  },

  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 4,
  },
  row: { flexDirection: 'row' },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 18,
  },

  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: 10,
  },

  cta: {
    marginTop: 18,
    paddingVertical: 16,
    borderRadius: 14,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 5,
  },

  footerLink: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 4,
  },
  footerText: { color: colors.subtext, fontSize: 14 },
  footerAccent: { color: colors.primary, fontWeight: '700' },

  fineprint: {
    color: colors.muted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 16,
    marginHorizontal: 32,
    lineHeight: 16,
  },
});

const roleCard = StyleSheet.create({
  wrap: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.mist,
    alignItems: 'flex-start',
    minWidth: 0,
  },
  active: {
    borderColor: colors.primary,
    backgroundColor: colors.blush,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 3,
  },
  iconBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  iconBubbleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  glyph: { fontSize: 18 },
  label: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 15,
  },
  labelActive: { color: colors.primaryDark },
  hint: {
    color: colors.subtext,
    fontSize: 11,
    marginTop: 2,
    lineHeight: 14,
  },
  hintActive: { color: colors.primary },
});

const bloodChip = StyleSheet.create({
  wrap: {
    minWidth: 62,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.mist,
    marginHorizontal: 4,
    marginBottom: 8,
    alignItems: 'center',
  },
  active: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  text: {
    color: colors.primaryDark,
    fontWeight: '800',
    fontSize: 14,
  },
  textActive: { color: '#fff' },
});
