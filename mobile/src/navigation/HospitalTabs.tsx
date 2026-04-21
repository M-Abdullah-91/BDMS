import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';
import HospitalHomeScreen from '../screens/hospital/HospitalHomeScreen';
import InventoryScreen from '../screens/hospital/InventoryScreen';
import HospitalRequestsScreen from '../screens/hospital/HospitalRequestsScreen';
import CreateRequestScreen from '../screens/hospital/CreateRequestScreen';
import DonorSearchScreen from '../screens/hospital/DonorSearchScreen';
import PendingReportsScreen from '../screens/hospital/PendingReportsScreen';
import RecordDonationScreen from '../screens/hospital/RecordDonationScreen';
import HospitalProfileScreen from '../screens/hospital/HospitalProfileScreen';
import RequestDetailScreen from '../screens/shared/RequestDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HospitalHome" component={HospitalHomeScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="PendingReports" component={PendingReportsScreen} options={{ title: 'Pending Verifications' }} />
      <Stack.Screen name="DonorSearch" component={DonorSearchScreen} options={{ title: 'Find Donors' }} />
      <Stack.Screen name="RecordDonation" component={RecordDonationScreen} options={{ title: 'Record Donation' }} />
    </Stack.Navigator>
  );
}

function RequestsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="HospitalRequests" component={HospitalRequestsScreen} options={{ title: 'Our Requests' }} />
      <Stack.Screen name="CreateRequest" component={CreateRequestScreen} options={{ title: 'New Request' }} />
      <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Request' }} />
    </Stack.Navigator>
  );
}

export default function HospitalTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === 'Home' ? 'home' :
            route.name === 'Inventory' ? 'cube' :
            route.name === 'Requests' ? 'water' : 'business';
          return <Ionicons name={icon as any} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Inventory" component={InventoryScreen} />
      <Tab.Screen name="Requests" component={RequestsStack} />
      <Tab.Screen name="Profile" component={HospitalProfileScreen} />
    </Tab.Navigator>
  );
}
