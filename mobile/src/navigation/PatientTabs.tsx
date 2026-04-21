import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../theme/colors';
import PatientHomeScreen from '../screens/patient/PatientHomeScreen';
import PatientCreateRequestScreen from '../screens/patient/PatientCreateRequestScreen';
import PatientProfileScreen from '../screens/patient/PatientProfileScreen';
import RequestDetailScreen from '../screens/shared/RequestDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PatientHome" component={PatientHomeScreen} options={{ title: 'My Requests' }} />
      <Stack.Screen name="RequestDetail" component={RequestDetailScreen} options={{ title: 'Request' }} />
    </Stack.Navigator>
  );
}

function CreateStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="PatientCreateRequest" component={PatientCreateRequestScreen} options={{ title: 'Post Blood Request' }} />
    </Stack.Navigator>
  );
}

export default function PatientTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarIcon: ({ color, size }) => {
          const icon =
            route.name === 'Home' ? 'water' :
            route.name === 'Ask' ? 'add-circle' : 'person';
          return <Ionicons name={icon as any} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Ask" component={CreateStack} options={{ title: 'Ask' }} />
      <Tab.Screen name="Profile" component={PatientProfileScreen} />
    </Tab.Navigator>
  );
}
