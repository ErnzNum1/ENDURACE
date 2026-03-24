import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// ── Foreground behaviour: show banner + play sound ────────────────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
  }),
});

// ── Create Android notification channel ──────────────────────────
export const setupNotificationChannel = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('order-updates', {
      name: 'Order Updates',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#38b6ff',
      sound: 'default',
    });
  }
};

// ── Request permission + get Expo push token ──────────────────────
export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices.');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Push notification permission not granted.');
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  return tokenData.data; // e.g. "ExponentPushToken[xxxxxx]"
};

// ── Subscribe to notification tap (background/killed) ────────────
// Returns unsubscribe function — call it in useEffect cleanup.
export const addNotificationResponseListener = (callback) => {
  const sub = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    callback(data);
  });
  return () => sub.remove();
};

// ── Subscribe to foreground notifications ────────────────────────
export const addForegroundNotificationListener = (callback) => {
  const sub = Notifications.addNotificationReceivedListener((notification) => {
    callback(notification);
  });
  return () => sub.remove();
};

// ── Get the last notification that launched the app (killed state) ─
export const getLastNotificationResponse = async () => {
  return await Notifications.getLastNotificationResponseAsync();
};