//Navigation
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SymptomDetailCheckScreen from 'screens/History/Telemedicine/SymptomDetailCheck';
import TelemedicineRoomScreen from 'screens/History/Telemedicine/TelemedicineRoom';
import TelemedicineCompleteScreen from 'screens/History/Telemedicine/TelemedicineComplete';
import PaymentScreen from 'screens/History/Telemedicine/Payment';
import PaymentCompleteScreen from 'screens/History/Telemedicine/PaymentComplete';
import TelemedicineDetailScreen from 'screens/History/Telemedicine/TelemedicineDetail';
import TelemedicineOpinionScreen from 'screens/History/Telemedicine/TelemedicineOpinion';

//Components
import NavigationBackArrow from 'components/NavigationBackArrow';

const Stack = createNativeStackNavigator();

export default function HistoryInnerStackNavigation({ navigation }) {

  return (
    <Stack.Navigator>
      <Stack.Group screenOptions={{ headerLargeTitleShadowVisible: false }}>
        <Stack.Screen
          name="SymptomDetailCheck"
          component={SymptomDetailCheckScreen}
          options={{
            title: '진료 전 확인사항',
            headerLeft: () => <NavigationBackArrow action={() => navigation.goBack()} />,
          }}
        />
        <Stack.Screen
          name="TelemedicineRoom"
          component={TelemedicineRoomScreen}
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="TelemedicineComplete"
          component={TelemedicineCompleteScreen}
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="Payment"
          component={PaymentScreen}
          options={{ 
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="PaymentComplete"
          component={PaymentCompleteScreen}
          options={{
            title: '결제 완료',
            headerBackVisible: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="TelemedicineDetail"
          component={TelemedicineDetailScreen}
          options={{
            title: '진료 내역',
            headerLeft: () => <NavigationBackArrow action={() => navigation.goBack()} />,
          }}
        />
        <Stack.Screen
          name="TelemedicineOpinion"
          component={TelemedicineOpinionScreen}
          options={{
            title: '전자 소견서',
            headerLeft: () => <NavigationBackArrow action={() => navigation.navigate('TelemedicineDetail')} />,
          }}
        />
      </Stack.Group>
    </Stack.Navigator>
  );
}