import React from 'react';
import { View, TouchableOpacity, Linking } from 'react-native';
import { Text } from '../components/CustomText';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Icon } from '@ant-design/react-native';
import ShipmentsListScreen from '../screens/shipments-list-screen';
import CreateShipmentScreen from '../screens/create-screen';
import ProfileScreen from '../screens/profile-screen';
import AuthScreen from '../screens/auth-screen';
import ShipmentDetailsScreen from '../screens/shipment-details-screen';
import CheckScreen from '../screens/check-screen';
import { COLORS } from '../consts/colors';
import { STYLES } from '../consts/styles';
import { useAuth } from '../contexts/auth-context';
import { OfflineIndicator } from '../components/OfflineIndicator';
import LogoutIcon from '../assets/icons/logout';

export type BottomTabParamList = {
  Shipments: undefined;
  Create: undefined;
  Profile: undefined;
};
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  CheckScreen: undefined;
  ShipmentDetails: { id: string };
};

const Tab = createBottomTabNavigator<BottomTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const HeaderLeft = () => {
  const handleReportBug = () => {
    const url =
      'https://kfp-perfection-production.up.railway.app/?portal=ak-svekla';
    Linking.openURL(url).catch(err =>
      console.error('Не удалось открыть ссылку:', err),
    );
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <TouchableOpacity
        onPress={handleReportBug}
        style={{
          marginLeft: 15,
          padding: 5,
        }}
      >
        <Icon
          name="question-circle"
          color={COLORS.textSecondary}
          style={{ fontSize: 24 }}
        />
      </TouchableOpacity>
    </View>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="Create"
    screenOptions={({ route }) => ({
      headerShown: true,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textSecondary,
      tabBarStyle: {
        backgroundColor: COLORS.card,
        borderTopColor: COLORS.border,
      },
      headerLeft: () => <HeaderLeft />,
      tabBarIcon: ({ color, size }) => {
        let name = 'profile';
        if (route.name === 'Shipments') name = 'car';
        if (route.name === 'Create') name = 'plus-circle';
        if (route.name === 'Profile') name = 'user';
        return (
          <Icon name={name as any} color={color} style={{ fontSize: size }} />
        );
      },
    })}
  >
    <Tab.Screen
      name="Shipments"
      component={ShipmentsListScreen}
      options={{
        tabBarLabel: 'Рейсы',
        title: 'Список рейсов',
      }}
    />
    <Tab.Screen
      name="Create"
      component={CreateShipmentScreen}
      options={{
        tabBarLabel: 'Создать',
        title: 'Создать рейс',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarLabel: 'Профиль',
        title: 'Профиль',
      }}
    />
  </Tab.Navigator>
);

const RootNavigator = () => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#fff',
        }}
      >
        <Text style={STYLES.loading}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          {user?.role?.value === 'producer' ? (
            <>
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ title: 'Список рейсов', headerBackTitle: 'Назад' }}
              />
              <Stack.Screen
                name="ShipmentDetails"
                component={ShipmentDetailsScreen}
                options={{
                  headerShown: true,
                  title: 'Рейс',
                }}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="CheckScreen"
                component={CheckScreen}
                options={{
                  headerShown: true,
                  title: 'Главная',
                  headerLeft: () => <HeaderLeft />,
                }}
              />
              <Stack.Screen
                name="ShipmentDetails"
                component={ShipmentDetailsScreen}
                options={{
                  headerShown: true,
                  title: 'Рейс',
                  headerLeft: () => <HeaderLeft />,
                }}
              />
            </>
          )}
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
