import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts, Oswald_700Bold } from '@expo-google-fonts/oswald';
import { Montserrat_400Regular, Montserrat_700Bold } from '@expo-google-fonts/montserrat';
import * as SplashScreen from 'expo-splash-screen';
import { Provider, useDispatch } from 'react-redux';
import { View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './src/store/store';
import { AuthProvider, useAuth } from './src/context/auth';
import { initCartDB } from './src/utils/cartDatabase';
import { hydrateCart } from './src/store/cartSlice';
import {
  setupNotificationChannel,
  addNotificationResponseListener,
  getLastNotificationResponse,
} from './src/utils/notificationSetup';

import FrontPageScreen from './src/screens/FrontPageScreen';
import AuthLayout      from './src/layout/AuthLayout';
import MainLayout      from './src/layout/MainLayout';

SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { loading } = useAuth();
  const dispatch    = useDispatch();
  const navRef      = useRef(null);

  useEffect(() => {
    initCartDB();
    dispatch(hydrateCart());
    setupNotificationChannel();

    const unsub = addNotificationResponseListener((data) => {
      navigateFromNotification(data);
    });

    getLastNotificationResponse().then((response) => {
      if (response) navigateFromNotification(response.notification.request.content.data);
    });

    return unsub;
  }, []);

  const navigateFromNotification = (data) => {
    if (!navRef.current || !data) return;
    const nav = navRef.current;
    if (data.screen === 'OrderInfo' && data.orderId) {
      nav.navigate('Main', { screen: 'Drawer', params: { screen: 'OrderInfo', params: { orderId: data.orderId } } });
    } else if (data.screen === 'Promotion') {
      nav.navigate('Main', { screen: 'Drawer', params: { screen: 'Promotion', params: { title: data.title || '', body: data.body || '', discountCode: data.discountCode || null } } });
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#010101', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navRef}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="FrontPage" component={FrontPageScreen} />
        <Stack.Screen name="Auth"      component={AuthLayout} />
        <Stack.Screen name="Main"      component={MainLayout} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    Oswald_700Bold,
    Montserrat_400Regular,
    Montserrat_700Bold,
  });

  // ✅ Hide splash screen as soon as fonts are loaded or failed
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // ✅ Don't render anything until fonts are ready
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </Provider>
    </SafeAreaProvider>
  );
}