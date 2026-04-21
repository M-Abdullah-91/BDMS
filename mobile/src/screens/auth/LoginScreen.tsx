import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Button } from '../../components/Button';
import { TextField } from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

// Refined red palette
const theme = {
  primary: '#E11D48',        // Rose-600 — main brand
  primaryDark: '#9F1239',    // Rose-800 — deep accent
  primarySoft: '#FFF1F2',    // Rose-50 — soft wash
  accent: '#F43F5E',         // Rose-500 — highlights
  bg: '#FFFBFB',             // Warm off-white
  card: '#FFFFFF',
  text: '#1F2937',           // Slate-800
  subtext: '#6B7280',        // Slate-500
  muted: '#9CA3AF',
  border: 'rgba(225, 29, 72, 0.08)',
  shadow: '#E11D48',
};

export default function LoginScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }),
    ]).start();

    // Subtle pulse on logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const submit = async () => {
    if (!username || !password) {
      Alert.alert('Missing fields', 'Enter your username and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(username.trim(), password);
    } catch (e: any) {
      Alert.alert('Login failed', e?.response?.data?.detail || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />

      {/* Decorative gradient blobs */}
      <View style={styles.blobTop} pointerEvents="none">
        <LinearGradient
          colors={['rgba(244, 63, 94, 0.18)', 'rgba(225, 29, 72, 0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.blobGradient}
        />
      </View>
      <View style={styles.blobBottom} pointerEvents="none">
        <LinearGradient
          colors={['rgba(159, 18, 57, 0.12)', 'rgba(225, 29, 72, 0.02)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.blobGradient}
        />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <Animated.View
            style={[
              styles.hero,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Animated.View
              style={[
                styles.logoWrapper,
                { transform: [{ scale: Animated.multiply(logoScale, pulseAnim) }] },
              ]}
            >
              <LinearGradient
                colors={[theme.accent, theme.primary, theme.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoCircle}
              >
                <Text style={styles.logoIcon}>♥</Text>
              </LinearGradient>
              <View style={styles.logoGlow} />
            </Animated.View>

            <Text style={styles.brand}>VitalStream</Text>
            <Text style={styles.tag}>
              A digital bridge between{'\n'}donors and hospitals
            </Text>
          </Animated.View>

          {/* Form Card */}
          <Animated.View
            style={[
              styles.card,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.welcome}>Welcome back</Text>
            <Text style={styles.welcomeSub}>Sign in to continue saving lives</Text>

            <View style={styles.fieldWrapper}>
              <View
                style={[
                  styles.inputShell,
                  focusedField === 'username' && styles.inputShellFocused,
                ]}
              >
                <TextField
                  label="Username"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            <View style={styles.fieldWrapper}>
              <View
                style={[
                  styles.inputShell,
                  focusedField === 'password' && styles.inputShellFocused,
                ]}
              >
                <TextField
                  label="Password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <Pressable
                  onPress={() => setShowPassword((s) => !s)}
                  style={styles.eyeBtn}
                  hitSlop={10}
                >
                  <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                </Pressable>
              </View>
            </View>

            <Pressable style={styles.forgotBtn} hitSlop={8}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {/* Primary Gradient Button */}
            <Pressable
              onPress={submit}
              disabled={loading}
              style={({ pressed }) => [
                styles.primaryBtnWrap,
                pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 },
              ]}
            >
              <LinearGradient
                colors={[theme.accent, theme.primary, theme.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryBtn}
              >
                <Text style={styles.primaryBtnText}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </Text>
              </LinearGradient>
            </Pressable>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Secondary Button */}
            <Pressable
              onPress={() => navigation.navigate('Register')}
              style={({ pressed }) => [
                styles.secondaryBtn,
                pressed && { backgroundColor: theme.primarySoft },
              ]}
            >
              <Text style={styles.secondaryBtnText}>Create an account</Text>
            </Pressable>
          </Animated.View>

          {/* Footer */}
          <Animated.View style={[styles.footer, { opacity: fadeAnim }]}>
            <Text style={styles.footerText}>
              By continuing, you agree to our{' '}
              <Text style={styles.footerLink}>Terms</Text> &{' '}
              <Text style={styles.footerLink}>Privacy Policy</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 70 : 50,
    paddingBottom: 40,
  },

  // Decorative blobs
  blobTop: {
    position: 'absolute',
    top: -120,
    right: -100,
    width: 320,
    height: 320,
    borderRadius: 160,
    overflow: 'hidden',
  },
  blobBottom: {
    position: 'absolute',
    bottom: -140,
    left: -120,
    width: 340,
    height: 340,
    borderRadius: 170,
    overflow: 'hidden',
  },
  blobGradient: {
    flex: 1,
  },

  // Hero
  hero: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoWrapper: {
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 76,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 12,
  },
  logoIcon: {
    fontSize: 38,
    color: '#fff',
    fontWeight: '700',
  },
  logoGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.primary,
    opacity: 0.15,
    zIndex: -1,
  },
  brand: {
    fontSize: 34,
    fontWeight: '800',
    color: theme.text,
    letterSpacing: -0.8,
    marginBottom: 8,
  },
  tag: {
    fontSize: 15,
    color: theme.subtext,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '400',
  },

  // Card
  card: {
    backgroundColor: theme.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  welcome: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.text,
    letterSpacing: -0.4,
  },
  welcomeSub: {
    fontSize: 14,
    color: theme.subtext,
    marginTop: 4,
    marginBottom: 22,
  },

  // Fields
  fieldWrapper: {
    marginBottom: 14,
  },
  inputShell: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
    position: 'relative',
  },
  inputShellFocused: {
    borderColor: theme.primary,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -10,
  },
  eyeText: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Forgot
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 20,
  },
  forgotText: {
    color: theme.primary,
    fontSize: 13,
    fontWeight: '600',
  },

  // Primary button
  primaryBtnWrap: {
    borderRadius: 14,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.border,
  },
  dividerText: {
    marginHorizontal: 12,
    color: theme.muted,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },

  // Secondary
  secondaryBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: theme.primary,
    backgroundColor: 'transparent',
  },
  secondaryBtnText: {
    color: theme.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Footer
  footer: {
    marginTop: 28,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: theme.muted,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: theme.primary,
    fontWeight: '600',
  },
});