import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ImageBackground, Dimensions, KeyboardAvoidingView,
  Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import AuthHeader from '../components/AuthHeader';
import { useAuth } from '../context/auth';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772175765/4569b7cf-0df7-497e-81b4-dabc333985fc.png';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const FACEBOOK_APP_ID  = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID  || 'YOUR_FACEBOOK_APP_ID';

const LoginScreen = ({ navigation }) => {
  const { login, loginWithGoogle, loginWithFacebook } = useAuth();

  const [email,        setEmail]        = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [error,        setError]        = useState('');

  const [, googleResponse, promptGoogleAsync]     = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID, iosClientId: GOOGLE_CLIENT_ID, androidClientId: GOOGLE_CLIENT_ID,
  });
  const [, fbResponse, promptFacebookAsync] = Facebook.useAuthRequest({ clientId: FACEBOOK_APP_ID });

  useEffect(() => {
    if (googleResponse?.type === 'success') handleGoogleSuccess(googleResponse.authentication.accessToken);
  }, [googleResponse]);

  useEffect(() => {
    if (fbResponse?.type === 'success') handleFacebookSuccess(fbResponse.authentication.accessToken);
  }, [fbResponse]);

  const handleGoogleSuccess = async (googleAccessToken) => {
    try {
      setSubmitting(true); setError('');
      const res      = await fetch('https://www.googleapis.com/userinfo/v2/me', { headers: { Authorization: `Bearer ${googleAccessToken}` } });
      const userInfo = await res.json();
      await loginWithGoogle({ googleId: userInfo.id, email: userInfo.email, firstName: userInfo.given_name || '', lastName: userInfo.family_name || '', avatar: userInfo.picture || '' });
      navigation.navigate('Main', { screen: 'Landing' });
    } catch (e) { setError(e.message || 'Google login failed'); }
    finally { setSubmitting(false); }
  };

  const handleFacebookSuccess = async (fbAccessToken) => {
    try {
      setSubmitting(true); setError('');
      const res      = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${fbAccessToken}`);
      const userInfo = await res.json();
      const [firstName, ...rest] = (userInfo.name || '').split(' ');
      await loginWithFacebook({ facebookId: userInfo.id, email: userInfo.email || '', firstName, lastName: rest.join(' '), avatar: userInfo.picture?.data?.url || '' });
      navigation.navigate('Main', { screen: 'Landing' });
    } catch (e) { setError(e.message || 'Facebook login failed'); }
    finally { setSubmitting(false); }
  };

  const handleLogin = async () => {
    setError('');
    if (!email.trim()) return setError('Email is required.');
    if (!password)     return setError('Password is required.');
    try {
      setSubmitting(true);
      await login(email.trim(), password);
      navigation.navigate('Main', { screen: 'Landing' });
    } catch (e) { setError(e.message || 'Login failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  return (
    <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.headerArea}>
            <AuthHeader title="LOGIN" />
          </View>
          <View style={styles.formContainer}>
            {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#888" placeholder="you@example.com" />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput style={styles.passwordInput} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} placeholderTextColor="#888" placeholder="••••••••" />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size={20} color="#aaa" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleLogin} activeOpacity={0.85} disabled={submitting}>
              {submitting ? <ActivityIndicator color="#010101" /> : <Text style={styles.submitText}>LOG IN</Text>}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialRow}>
              <TouchableOpacity style={styles.googleBtn} activeOpacity={0.8} onPress={() => promptGoogleAsync()} disabled={submitting}>
                <FontAwesomeIcon icon={faGoogle} size={20} color="#ffffff" />
                <Text style={styles.socialText}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.facebookBtn} activeOpacity={0.8} onPress={() => promptFacebookAsync()} disabled={submitting}>
                <FontAwesomeIcon icon={faFacebook} size={20} color="#ffffff" />
                <Text style={styles.socialText}>Facebook</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Auth', { screen: 'Register' })}>
                <Text style={styles.switchLink}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>EndurACE. All Rights Reserved © 2026.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:            { flex: 1, width, height },
  overlay:       { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  flex:          { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'space-between' },
  headerArea:    { marginTop: 80, marginBottom: 40 },
  formContainer: { paddingHorizontal: 30, flex: 1 },
  errorBox:      { backgroundColor: 'rgba(255,49,49,0.18)', borderWidth: 1, borderColor: '#ff3131', borderRadius: 6, padding: 12, marginBottom: 10 },
  errorText:     { fontFamily: 'Montserrat_400Regular', color: '#ff3131', fontSize: 13 },
  label:         { fontFamily: 'Montserrat_400Regular', fontSize: 14, color: '#ffffff', marginBottom: 8, marginTop: 14 },
  input:         { backgroundColor: '#3a3a3a', borderWidth: 1, borderColor: '#555', borderRadius: 6, height: 56, paddingHorizontal: 16, color: '#ffffff', fontSize: 15 },
  passwordWrapper:{ flexDirection: 'row', backgroundColor: '#3a3a3a', borderWidth: 1, borderColor: '#555', borderRadius: 6, height: 56, alignItems: 'center' },
  passwordInput: { flex: 1, paddingHorizontal: 16, color: '#ffffff', fontSize: 15, height: '100%' },
  eyeBtn:        { padding: 14 },
  submitBtn:     { backgroundColor: '#ffffff', borderRadius: 6, height: 56, alignItems: 'center', justifyContent: 'center', marginTop: 28, marginBottom: 20 },
  submitText:    { fontFamily: 'Montserrat_700Bold', fontSize: 15, fontWeight: '700', color: '#010101', letterSpacing: 1 },
  dividerRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine:   { flex: 1, height: 1, backgroundColor: '#555' },
  dividerText:   { fontFamily: 'Montserrat_400Regular', color: '#888', fontSize: 12, marginHorizontal: 12 },
  socialRow:     { flexDirection: 'row', gap: 12, marginBottom: 20 },
  googleBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#DB4437', borderRadius: 6, height: 50 },
  facebookBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#1877F2', borderRadius: 6, height: 50 },
  socialText:    { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontSize: 14, fontWeight: '700' },
  switchRow:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchText:    { fontFamily: 'Montserrat_400Regular', color: '#cccccc', fontSize: 14 },
  switchLink:    { fontFamily: 'Montserrat_700Bold', color: '#ffde59', fontSize: 14, fontWeight: '700' },
  footer:        { alignItems: 'center', paddingBottom: 30, paddingTop: 40 },
  footerText:    { fontFamily: 'Montserrat_400Regular', color: '#888', fontSize: 12 },
});

export default LoginScreen;