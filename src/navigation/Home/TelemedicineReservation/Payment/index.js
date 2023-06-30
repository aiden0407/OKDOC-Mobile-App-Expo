//Navigation
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PaymentScreen from 'screens/Home/Telemedicine/Payment';
import PaymentCompleteScreen from 'screens/Home/Telemedicine/PaymentComplete';

const Stack = createNativeStackNavigator();

export default function TelemedicineReservation({ navigation }) {

  return (
    <Stack.Navigator>
      <Stack.Group screenOptions={{ headerLargeTitleShadowVisible: false }}>
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="PaymentComplete"
          component={PaymentCompleteScreen}
          options={{
            title: '결제 완료',
            headerBackVisible: false,
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}