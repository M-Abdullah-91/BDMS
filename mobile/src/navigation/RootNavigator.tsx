import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import AuthNavigator from './AuthNavigator';
import DonorTabs from './DonorTabs';
import HospitalTabs from './HospitalTabs';
import PatientTabs from './PatientTabs';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user.role === 'hospital_admin' ? (
        <Stack.Screen name="Hospital" component={HospitalTabs} />
      ) : user.role === 'patient' ? (
        <Stack.Screen name="Patient" component={PatientTabs} />
      ) : (
        <Stack.Screen name="Donor" component={DonorTabs} />
      )}
    </Stack.Navigator>
  );
}
