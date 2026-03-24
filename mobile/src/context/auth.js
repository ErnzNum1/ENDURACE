import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {
  saveTokens, getStoredTokens, clearTokens,
  loginUser, registerUser, refreshAccessToken, logoutUser,
  googleOAuth, facebookOAuth, updateUserProfile,
  deactivateUserAccount, savePushToken,
} from '../services/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,         setUser]         = useState(null);
  const [accessToken,  setAccessToken]  = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [authError,    setAuthError]    = useState('');
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const { refreshToken: rt, user: u } = await getStoredTokens();
        if (rt && u) {
          try {
            const refreshed = await refreshAccessToken(rt);
            await saveTokens(refreshed.accessToken, refreshed.refreshToken, refreshed.user);
            setUser(refreshed.user);
            setAccessToken(refreshed.accessToken);
            setRefreshToken(refreshed.refreshToken);
            scheduleRefresh(refreshed.accessToken);
          } catch { await clearTokens(); }
        }
      } catch { await clearTokens(); }
      finally { setLoading(false); }
    })();
    return () => clearTimerIfSet();
  }, []);

  const scheduleRefresh = (tok) => {
    clearTimerIfSet();
    refreshTimerRef.current = setTimeout(async () => {
      try {
        const { refreshToken: rt } = await getStoredTokens();
        if (!rt) return;
        const refreshed = await refreshAccessToken(rt);
        await saveTokens(refreshed.accessToken, refreshed.refreshToken, refreshed.user);
        setUser(refreshed.user);
        setAccessToken(refreshed.accessToken);
        setRefreshToken(refreshed.refreshToken);
        scheduleRefresh(refreshed.accessToken);
      } catch { await clearSession(); }
    }, 13 * 60 * 1000);
  };

  const clearTimerIfSet = () => {
    if (refreshTimerRef.current) { clearTimeout(refreshTimerRef.current); refreshTimerRef.current = null; }
  };

  const registerPushToken = async (token) => {
    try {
      if (Platform.OS === 'web' || !Device.isDevice) return;
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      const { data: expoPushToken } = await Notifications.getExpoPushTokenAsync();
      if (token && expoPushToken) await savePushToken(token, expoPushToken);
    } catch {}
  };

  const login = async (email, password) => {
    setAuthError('');
    const data = await loginUser({ email, password });
    await saveTokens(data.accessToken, data.refreshToken, data.user);
    setUser(data.user); setAccessToken(data.accessToken); setRefreshToken(data.refreshToken);
    scheduleRefresh(data.accessToken);
    await registerPushToken(data.accessToken);
  };

  const register = async (firstName, lastName, email, password) => {
    setAuthError('');
    const data = await registerUser({ firstName, lastName, email, password });
    await saveTokens(data.accessToken, data.refreshToken, data.user);
    setUser(data.user); setAccessToken(data.accessToken); setRefreshToken(data.refreshToken);
    scheduleRefresh(data.accessToken);
    await registerPushToken(data.accessToken);
  };

  const loginWithGoogle = async (googlePayload) => {
    setAuthError('');
    const data = await googleOAuth(googlePayload);
    await saveTokens(data.accessToken, data.refreshToken, data.user);
    setUser(data.user); setAccessToken(data.accessToken); setRefreshToken(data.refreshToken);
    scheduleRefresh(data.accessToken);
    await registerPushToken(data.accessToken);
  };

  const loginWithFacebook = async (fbPayload) => {
    setAuthError('');
    const data = await facebookOAuth(fbPayload);
    await saveTokens(data.accessToken, data.refreshToken, data.user);
    setUser(data.user); setAccessToken(data.accessToken); setRefreshToken(data.refreshToken);
    scheduleRefresh(data.accessToken);
    await registerPushToken(data.accessToken);
  };

  const updateProfile = async (formData) => {
    const updatedUser = await updateUserProfile(accessToken, formData);
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    await saveTokens(accessToken, refreshToken, newUser);
    return updatedUser;
  };

  const logout = async () => {
    clearTimerIfSet();
    try { await logoutUser(accessToken); } catch {}
    await clearSession();
  };

  const deactivate = async () => {
    clearTimerIfSet();
    try { await deactivateUserAccount(accessToken); } catch {}
    await clearSession();
  };

  const clearSession = async () => {
    await clearTokens();
    setUser(null); setAccessToken(null); setRefreshToken(null);
  };

  return (
    <AuthContext.Provider value={{
      user, accessToken, loading, authError, setAuthError,
      isAuthenticated: !!user,
      login, register, loginWithGoogle, loginWithFacebook,
      updateProfile, logout, deactivate,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};