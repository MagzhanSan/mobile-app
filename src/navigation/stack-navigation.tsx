import React from 'react';
import { View, TouchableOpacity } from 'react-native';
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

// Компонент кнопки выхода
const LogoutButton = () => {
  const { logout } = useAuth();

  return (
    <TouchableOpacity
      onPress={logout}
      style={{
        marginRight: 15,
        padding: 5,
      }}
    >
      <LogoutIcon width={20} height={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
  );
};

// Компонент заголовка с оффлайн индикатором
const HeaderRight = () => {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <OfflineIndicator />
      <LogoutButton />
    </View>
  );
};

const MainTabs = () => (
  <Tab.Navigator
    initialRouteName="Shipments"
    screenOptions={({ route }) => ({
      headerShown: true,
      headerRight: () => <HeaderRight />,
      tabBarActiveTintColor: COLORS.primary,
      tabBarInactiveTintColor: COLORS.textSecondary,
      tabBarStyle: {
        backgroundColor: COLORS.card,
        borderTopColor: COLORS.border,
      },
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
                  headerRight: () => <LogoutButton />,
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
                  headerRight: () => <LogoutButton />,
                }}
              />
              <Stack.Screen
                name="ShipmentDetails"
                component={ShipmentDetailsScreen}
                options={{
                  headerShown: true,
                  title: 'Рейс',
                  headerRight: () => <LogoutButton />,
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
