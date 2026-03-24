import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  ActivityIndicator,
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
const BG_IMAGE =
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772175765/4569b7cf-0df7-497e-81b4-dabc333985fc.png';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || 'YOUR_FACEBOOK_APP_ID';

const RegisterScreen = ({ navigation }) => {
  const { register, loginWithGoogle, loginWithFacebook } = useAuth();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const [_gReq, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_CLIENT_ID,
    androidClientId: GOOGLE_CLIENT_ID,
  });
  const [_fbReq, fbResponse, promptFacebookAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID,
  });

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (googleResponse?.type === 'success') {
      handleGoogleSuccess(googleResponse.authentication.accessToken);
    }
  }, [googleResponse]);

  useEffect(() => {
    if (fbResponse?.type === 'success') {
      handleFacebookSuccess(fbResponse.authentication.accessToken);
    }
  }, [fbResponse]);

  const handleGoogleSuccess = async (googleAccessToken) => {
    try {
      setSubmitting(true);
      setError('');
      const userInfoRes = await fetch('https://www.googleapis.com/userinfo/v2/me', {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      });
      const userInfo = await userInfoRes.json();
      await loginWithGoogle({
        googleId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name || '',
        lastName: userInfo.family_name || '',
        avatar: userInfo.picture || '',
      });
      navigation.navigate('Main', { screen: 'Landing' });
    } catch (e) {
      setError(e.message || 'Google sign-up failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFacebookSuccess = async (fbAccessToken) => {
    try {
      setSubmitting(true);
      setError('');
      const userInfoRes = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${fbAccessToken}`
      );
      const userInfo = await userInfoRes.json();
      const [fn, ...rest] = (userInfo.name || '').split(' ');
      await loginWithFacebook({
        facebookId: userInfo.id,
        email: userInfo.email || '',
        firstName: fn,
        lastName: rest.join(' '),
        avatar: userInfo.picture?.data?.url || '',
      });
      navigation.navigate('Main', { screen: 'Landing' });
    } catch (e) {
      setError(e.message || 'Facebook sign-up failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setError('');
    if (!firstName.trim()) return setError('First name is required.');
    if (!lastName.trim()) return setError('Last name is required.');
    if (!email.trim()) return setError('Email is required.');
    if (!password) return setError('Password is required.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');

    try {
      setSubmitting(true);
      await register(firstName.trim(), lastName.trim(), email.trim(), password);
      navigation.navigate('Main', { screen: 'Landing' });
    } catch (e) {
      setError(e.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ImageBackground source={{ uri: BG_IMAGE }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
          >
            <View style={styles.headerArea}>
              <AuthHeader title="REGISTER" />
            </View>

            <View style={styles.formContainer}>
              {!!error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Name row */}
              <View style={styles.nameRow}>
                <View style={styles.nameHalf}>
                  <Text style={styles.label}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholderTextColor="#888"
                    placeholder="Juan"
                  />
                </View>
                <View style={styles.nameHalf}>
                  <Text style={styles.label}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholderTextColor="#888"
                    placeholder="dela Cruz"
                  />
                </View>
              </View>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#888"
                placeholder="you@example.com"
              />

              {/* Password row */}
              <View style={styles.passwordRow}>
                <View style={styles.passwordHalf}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={styles.passwordInput}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#888"
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeBtn}
                    >
                      <FontAwesomeIcon
                        icon={showPassword ? faEyeSlash : faEye}
                        size={18}
                        color="#aaa"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.passwordHalf}>
                  <Text style={styles.label}>Confirm</Text>
                  <View style={styles.passwordWrapper}>
                    <TextInput
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      placeholderTextColor="#888"
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      style={styles.eyeBtn}
                    >
                      <FontAwesomeIcon
                        icon={showConfirmPassword ? faEyeSlash : faEye}
                        size={18}
                        color="#aaa"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Divider */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or register with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social */}
              <View style={styles.socialRow}>
                <TouchableOpacity
                  style={styles.googleBtn}
                  activeOpacity={0.8}
                  onPress={() => promptGoogleAsync()}
                  disabled={submitting}
                >
                  <FontAwesomeIcon icon={faGoogle} size={20} color="#ffffff" />
                  <Text style={styles.socialText}>Google</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.facebookBtn}
                  activeOpacity={0.8}
                  onPress={() => promptFacebookAsync()}
                  disabled={submitting}
                >
                  <FontAwesomeIcon icon={faFacebook} size={20} color="#ffffff" />
                  <Text style={styles.socialText}>Facebook</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleRegister}
                activeOpacity={0.85}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#010101" />
                ) : (
                  <Text style={styles.submitText}>REGISTER</Text>
                )}
              </TouchableOpacity>

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
                >
                  <Text style={styles.switchLink}>Log In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  headerArea: { marginTop: 80, marginBottom: 30 },
  formContainer: { paddingHorizontal: 30, paddingBottom: 40 },
  errorBox: {
    backgroundColor: 'rgba(255,49,49,0.18)',
    borderWidth: 1,
    borderColor: '#ff3131',
    borderRadius: 6,
    padding: 12,
    marginBottom: 10,
  },
  errorText: { fontFamily: 'Montserrat_400Regular', color: '#ff3131', fontSize: 13 },
  nameRow: { flexDirection: 'row', gap: 12 },
  nameHalf: { flex: 1 },
  label: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: '#ffffff',
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#3a3a3a',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 6,
    height: 56,
    paddingHorizontal: 16,
    color: '#ffffff',
    fontSize: 15,
  },
  passwordRow: { flexDirection: 'row', gap: 12 },
  passwordHalf: { flex: 1 },
  passwordWrapper: {
    flexDirection: 'row',
    backgroundColor: '#3a3a3a',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 6,
    height: 56,
    alignItems: 'center',
  },
  passwordInput: { flex: 1, paddingHorizontal: 12, color: '#ffffff', fontSize: 14, height: '100%' },
  eyeBtn: { padding: 12 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#555' },
  dividerText: {
    fontFamily: 'Montserrat_400Regular',
    color: '#888',
    fontSize: 12,
    marginHorizontal: 12,
  },
  socialRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  googleBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#DB4437', borderRadius: 6, height: 50,
  },
  facebookBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, backgroundColor: '#1877F2', borderRadius: 6, height: 50,
  },
  socialText: { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontSize: 14, fontWeight: '700' },
  submitBtn: {
    backgroundColor: '#ffffff', borderRadius: 6, height: 56,
    alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  submitText: {
    fontFamily: 'Montserrat_700Bold', fontSize: 15, fontWeight: '700',
    color: '#010101', letterSpacing: 1,
  },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchText: { fontFamily: 'Montserrat_400Regular', color: '#cccccc', fontSize: 14 },
  switchLink: { fontFamily: 'Montserrat_700Bold', color: '#ffde59', fontSize: 14, fontWeight: '700' },
});

export default RegisterScreen;