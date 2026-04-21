import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';
import DonorHomeScreen from '../screens/donor/DonorHomeScreen';
import DonorRequestsScreen from '../screens/donor/DonorRequestsScreen';
import DonorHistoryScreen from '../screens/donor/DonorHistoryScreen';
import DonorProfileScreen from '../screens/donor/DonorProfileScreen';
import UploadReportScreen from '../screens/donor/UploadReportScreen';
import RequestDetailScreen from '../screens/shared/RequestDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function RequestsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Matching" component={DonorRequestsScreen} options={{ title: 'Blood Requests' }} />
      <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Request' }} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DonorProfile" component={DonorProfileScreen} options={{ title: 'My Profile' }} />
      <Stack.Screen name="UploadReport" component={UploadReportScreen} options={{ title: 'Upload Lab Report' }} />
    </Stack.Navigator>
  );
}

export default function DonorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === 'Home' ? 'home' :
            route.name === 'Requests' ? 'water' :
            route.name === 'History' ? 'time' : 'person';
          return <Ionicons name={icon as any} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={DonorHomeScreen} />
      <Tab.Screen name="Requests" component={RequestsStack} />
      <Tab.Screen name="History" component={DonorHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileStack} />
    </Tab.Navigator>
  );
}
