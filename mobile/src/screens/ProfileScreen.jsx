import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, Dimensions,
  SafeAreaView, ScrollView, TouchableOpacity, TextInput,
  Image, ActivityIndicator, Alert, Modal, Platform,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faBars, faPenToSquare, faCamera, faPhotoFilm,
  faCheck, faXmark, faRightFromBracket, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { DrawerActions } from '@react-navigation/native';
import { useAuth } from '../context/auth';

WebBrowser.maybeCompleteAuthSession();

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';
const COVER = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174858/8fa956f5-bbb2-4ebc-9e0f-40a1cc870652.png';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const FACEBOOK_APP_ID  = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID  || 'YOUR_FACEBOOK_APP_ID';

const ProfileScreen = ({ navigation }) => {
  const { user, updateProfile, logout, loginWithGoogle, loginWithFacebook } = useAuth();

  const [editing,       setEditing]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [firstName,     setFirstName]     = useState(user?.firstName || '');
  const [lastName,      setLastName]      = useState(user?.lastName  || '');
  const [email,         setEmail]         = useState(user?.email     || '');
  const [avatarAsset,   setAvatarAsset]   = useState(null); // expo image asset
  const [pickerMenu,    setPickerMenu]    = useState(false);
  const [deactivateModal, setDeactivateModal] = useState(false);

  const [, googleResponse, promptGoogleAsync]   = Google.useAuthRequest({ clientId: GOOGLE_CLIENT_ID });
  const [, fbResponse,     promptFacebookAsync] = Facebook.useAuthRequest({ clientId: FACEBOOK_APP_ID });

  React.useEffect(() => {
    if (googleResponse?.type === 'success') handleGoogleLink(googleResponse.authentication.accessToken);
  }, [googleResponse]);
  React.useEffect(() => {
    if (fbResponse?.type === 'success') handleFBLink(fbResponse.authentication.accessToken);
  }, [fbResponse]);

  const handleGoogleLink = async (tok) => {
    try {
      const info = await (await fetch('https://www.googleapis.com/userinfo/v2/me', { headers: { Authorization: `Bearer ${tok}` } })).json();
      await loginWithGoogle({ googleId: info.id, email: info.email, firstName: info.given_name || '', lastName: info.family_name || '', avatar: info.picture || '' });
      Alert.alert('Success', 'Google account linked!');
    } catch (e) { Alert.alert('Error', e.message); }
  };
  const handleFBLink = async (tok) => {
    try {
      const info = await (await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${tok}`)).json();
      const [fn, ...rest] = (info.name || '').split(' ');
      await loginWithFacebook({ facebookId: info.id, email: info.email || '', firstName: fn, lastName: rest.join(' '), avatar: info.picture?.data?.url || '' });
      Alert.alert('Success', 'Facebook account linked!');
    } catch (e) { Alert.alert('Error', e.message); }
  };

  const resetForm = () => {
    setFirstName(user?.firstName || '');
    setLastName(user?.lastName   || '');
    setEmail(user?.email         || '');
    setAvatarAsset(null);
    setEditing(false);
  };

  // ── Pick avatar ───────────────────────────────────────────────
  const pickAvatar = async (source) => {
    setPickerMenu(false);
    const opts = { mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85, allowsEditing: true, aspect: [1, 1] };
    let result;
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permission denied', 'Camera access is required.');
      result = await ImagePicker.launchCameraAsync(opts);
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permission denied', 'Gallery access is required.');
      result = await ImagePicker.launchImageLibraryAsync(opts);
    }
    if (!result.canceled && result.assets?.[0]) {
      setAvatarAsset(result.assets[0]);
    }
  };

  // ── Save profile ──────────────────────────────────────────────
  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      return Alert.alert('Validation', 'First and last name are required.');
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('firstName', firstName.trim());
      formData.append('lastName',  lastName.trim());
      formData.append('email',     email.trim());

      if (avatarAsset) {
        // Determine mime type from asset
        const mimeType = avatarAsset.mimeType || avatarAsset.type || 'image/jpeg';
        // Get file extension from uri or mimeType
        const ext = mimeType.includes('png') ? 'png' : 'jpg';
        // On iOS, strip file:// prefix; on Android keep the uri as-is
        const uri = Platform.OS === 'ios'
          ? avatarAsset.uri.replace('file://', '')
          : avatarAsset.uri;

        formData.append('avatar', {
          uri,
          type: mimeType,
          name: `avatar_${Date.now()}.${ext}`,
        });
      }

      await updateProfile(formData);
      setAvatarAsset(null);
      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully.');
    } catch (e) {
      Alert.alert('Error', e.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: async () => {
        await logout();
        navigation.reset({ index: 0, routes: [{ name: 'FrontPage' }] });
      }},
    ]);
  };

  const handleDeactivate = async () => {
    setDeactivateModal(false);
    // deactivate via logout (user's own deactivate)
    try {
      await logout();
      navigation.reset({ index: 0, routes: [{ name: 'FrontPage' }] });
    } catch {}
  };

  const avatarUri =
    avatarAsset?.uri ||
    user?.avatar     ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent((user?.firstName || 'U') + ' ' + (user?.lastName || ''))}&background=38b6ff&color=fff&size=200`;

  const hasGoogle   = !!user?.googleId   || user?.authProvider === 'google';
  const hasFacebook = !!user?.facebookId || user?.authProvider === 'facebook';
  const isAdmin     = user?.role === 'admin';

  return (
    <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.dispatch(DrawerActions.openDrawer())} activeOpacity={0.8}>
            <FontAwesomeIcon icon={faBars} size={20} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>PROFILE</Text>
          <TouchableOpacity
            style={styles.editToggleBtn}
            onPress={() => editing ? resetForm() : setEditing(true)}
            activeOpacity={0.8}
          >
            <FontAwesomeIcon icon={editing ? faXmark : faPenToSquare} size={18} color={editing ? '#ff3131' : '#ffffff'} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Cover + Avatar ── */}
          <View style={styles.coverWrap}>
            <Image source={{ uri: COVER }} style={styles.coverImage} resizeMode="cover" />
            <View style={styles.avatarWrap}>
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
              {editing && (
                <TouchableOpacity style={styles.cameraBtn} onPress={() => setPickerMenu(true)} activeOpacity={0.85}>
                  <FontAwesomeIcon icon={faCamera} size={14} color="#010101" />
                </TouchableOpacity>
              )}
            </View>
            {editing && avatarAsset && <Text style={styles.photoSelectedText}>✓ New photo selected</Text>}
          </View>

          {/* ── User name + role ── */}
          <View style={styles.nameBlock}>
            <Text style={styles.displayName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.displayEmail}>{user?.email}</Text>
            {isAdmin && <View style={styles.roleBadge}><Text style={styles.roleBadgeText}>ADMIN</Text></View>}
          </View>

          {/* ── Form card ── */}
          <View style={styles.formCard}>
            <Text style={styles.formSectionLabel}>PERSONAL INFO</Text>
            <View style={styles.fieldRow}>
              <View style={[styles.fieldBlock, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>FIRST NAME</Text>
                <TextInput style={[styles.input, !editing && styles.inputReadonly]} value={firstName} onChangeText={setFirstName} editable={editing} />
              </View>
              <View style={[styles.fieldBlock, { flex: 1 }]}>
                <Text style={styles.fieldLabel}>LAST NAME</Text>
                <TextInput style={[styles.input, !editing && styles.inputReadonly]} value={lastName} onChangeText={setLastName} editable={editing} />
              </View>
            </View>
            <View style={styles.fieldBlock}>
              <Text style={styles.fieldLabel}>EMAIL</Text>
              <TextInput
                style={[styles.input, (!editing || user?.authProvider !== 'local') && styles.inputReadonly]}
                value={email}
                onChangeText={setEmail}
                editable={editing && user?.authProvider === 'local'}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {editing && user?.authProvider !== 'local' && (
                <Text style={styles.hintText}>Email locked for social accounts.</Text>
              )}
            </View>

            {editing && (
              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                {saving
                  ? <ActivityIndicator color="#010101" />
                  : <><FontAwesomeIcon icon={faCheck} size={15} color="#010101" /><Text style={styles.saveBtnText}>SAVE CHANGES</Text></>
                }
              </TouchableOpacity>
            )}
          </View>

          {/* ── Quick links ── */}
          <View style={styles.formCard}>
            <Text style={styles.formSectionLabel}>MY ACTIVITY</Text>
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('Orders')} activeOpacity={0.8}>
              <Text style={styles.linkLabel}>My Orders</Text>
              <FontAwesomeIcon icon={faChevronRight} size={14} color="#aaa" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkRow} onPress={() => navigation.navigate('MyReviews')} activeOpacity={0.8}>
              <Text style={styles.linkLabel}>My Reviews</Text>
              <FontAwesomeIcon icon={faChevronRight} size={14} color="#aaa" />
            </TouchableOpacity>
          </View>

          {/* ── Connected accounts ── */}
          <View style={styles.formCard}>
            <Text style={styles.formSectionLabel}>CONNECTED ACCOUNTS</Text>
            {/* Google */}
            <View style={styles.connectedRow}>
              <View style={styles.connectedLeft}>
                <View style={[styles.connectedIcon, { backgroundColor: '#DB4437' }]}>
                  <FontAwesomeIcon icon={faGoogle} size={15} color="#ffffff" />
                </View>
                <View>
                  <Text style={styles.connectedLabel}>Google</Text>
                  <Text style={styles.connectedStatus}>{hasGoogle ? 'Connected' : 'Not connected'}</Text>
                </View>
              </View>
              {!hasGoogle && (
                <TouchableOpacity style={styles.linkBtn} onPress={() => promptGoogleAsync()} activeOpacity={0.8}>
                  <Text style={styles.linkBtnText}>LINK</Text>
                </TouchableOpacity>
              )}
              {hasGoogle && <View style={styles.connectedCheck}><Text style={styles.connectedCheckText}>✓</Text></View>}
            </View>
            {/* Facebook */}
            <View style={styles.connectedRow}>
              <View style={styles.connectedLeft}>
                <View style={[styles.connectedIcon, { backgroundColor: '#1877F2' }]}>
                  <FontAwesomeIcon icon={faFacebook} size={15} color="#ffffff" />
                </View>
                <View>
                  <Text style={styles.connectedLabel}>Facebook</Text>
                  <Text style={styles.connectedStatus}>{hasFacebook ? 'Connected' : 'Not connected'}</Text>
                </View>
              </View>
              {!hasFacebook && (
                <TouchableOpacity style={styles.linkBtn} onPress={() => promptFacebookAsync()} activeOpacity={0.8}>
                  <Text style={styles.linkBtnText}>LINK</Text>
                </TouchableOpacity>
              )}
              {hasFacebook && <View style={styles.connectedCheck}><Text style={styles.connectedCheckText}>✓</Text></View>}
            </View>
          </View>

          {/* ── Admin shortcut ── */}
          {isAdmin && (
            <View style={styles.formCard}>
              <TouchableOpacity style={styles.adminBtn} onPress={() => navigation.navigate('AdminDashboard')} activeOpacity={0.85}>
                <Text style={styles.adminBtnText}>OPEN ADMIN PANEL</Text>
                <FontAwesomeIcon icon={faChevronRight} size={14} color="#010101" />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Logout / Deactivate ── */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <FontAwesomeIcon icon={faRightFromBracket} size={16} color="#ff3131" />
            <Text style={styles.logoutBtnText}>LOG OUT</Text>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Image picker modal */}
      <Modal visible={pickerMenu} transparent animationType="fade" onRequestClose={() => setPickerMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setPickerMenu(false)}>
          <View style={styles.menuSheet}>
            <Text style={styles.menuTitle}>CHANGE PHOTO</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => pickAvatar('camera')}>
              <FontAwesomeIcon icon={faCamera} size={18} color="#ffde59" />
              <Text style={styles.menuItemText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => pickAvatar('gallery')}>
              <FontAwesomeIcon icon={faPhotoFilm} size={18} color="#38b6ff" />
              <Text style={styles.menuItemText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Deactivate confirm */}
      <Modal visible={deactivateModal} transparent animationType="fade" onRequestClose={() => setDeactivateModal(false)}>
        <View style={styles.menuOverlay}>
          <View style={[styles.menuSheet, { padding: 24 }]}>
            <Text style={styles.menuTitle}>DEACTIVATE ACCOUNT</Text>
            <Text style={{ fontFamily: 'Montserrat_400Regular', color: '#ccc', textAlign: 'center', marginBottom: 20, lineHeight: 22 }}>
              This will log you out. An admin will be required to reactivate your account.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity style={[styles.menuItem, { flex: 1, justifyContent: 'center', backgroundColor: '#3a3a3a', borderRadius: 8, paddingVertical: 12 }]} onPress={() => setDeactivateModal(false)}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#fff', fontSize: 14 }}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.menuItem, { flex: 1, justifyContent: 'center', backgroundColor: '#ff3131', borderRadius: 8, paddingVertical: 12 }]} onPress={handleDeactivate}>
                <Text style={{ fontFamily: 'Montserrat_700Bold', color: '#fff', fontSize: 14 }}>CONFIRM</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:      { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  safe:    { flex: 1 },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  menuBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: 'Oswald_700Bold', fontSize: 22, fontStyle: 'italic', color: '#ffffff', letterSpacing: 1 },
  editToggleBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  content: { paddingHorizontal: 16, paddingBottom: 40 },

  coverWrap:    { alignItems: 'center', marginBottom: 8 },
  coverImage:   { width: '100%', height: 160, borderRadius: 12, marginBottom: -55 },
  avatarWrap:   { position: 'relative' },
  avatar:       { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#38b6ff' },
  cameraBtn:    { position: 'absolute', bottom: 0, right: 0, width: 34, height: 34, borderRadius: 17, backgroundColor: '#ffde59', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  photoSelectedText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#38b6ff', marginTop: 6 },

  nameBlock:   { alignItems: 'center', marginTop: 10, marginBottom: 16 },
  displayName: { fontFamily: 'Oswald_700Bold', fontSize: 24, fontStyle: 'italic', color: '#ffffff', letterSpacing: 0.5 },
  displayEmail:{ fontFamily: 'Montserrat_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  roleBadge:   { marginTop: 6, backgroundColor: '#ffde59', paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  roleBadgeText:{ fontFamily: 'Montserrat_700Bold', fontSize: 10, fontWeight: '700', color: '#010101', letterSpacing: 1 },

  formCard:          { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, padding: 18, marginBottom: 14 },
  formSectionLabel:  { fontFamily: 'Montserrat_700Bold', fontSize: 10, fontWeight: '700', color: '#aaa', letterSpacing: 2, marginBottom: 14 },
  fieldRow:          { flexDirection: 'row', gap: 10 },
  fieldBlock:        { marginBottom: 12 },
  fieldLabel:        { fontFamily: 'Montserrat_700Bold', fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 1, marginBottom: 5 },
  input:             { backgroundColor: '#f4f4f4', borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, color: '#010101', fontFamily: 'Montserrat_400Regular', fontSize: 14 },
  inputReadonly:     { backgroundColor: '#ebebeb', color: '#555' },
  hintText:          { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: '#aaa', marginTop: 4 },
  saveBtn:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#ffde59', borderRadius: 10, height: 50, marginTop: 6 },
  saveBtnText:       { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#010101' },

  linkRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  linkLabel:    { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#010101' },
  connectedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  connectedLeft:{ flexDirection: 'row', alignItems: 'center', gap: 12 },
  connectedIcon:{ width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  connectedLabel: { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#010101' },
  connectedStatus:{ fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#888' },
  linkBtn:      { backgroundColor: '#ffde59', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  linkBtnText:  { fontFamily: 'Montserrat_700Bold', fontSize: 11, fontWeight: '700', color: '#010101' },
  connectedCheck:{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#38b6ff', alignItems: 'center', justifyContent: 'center' },
  connectedCheckText:{ fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#ffffff' },

  adminBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#ffde59', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 8 },
  adminBtnText:{ fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700', color: '#010101', letterSpacing: 1 },

  logoutBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(255,49,49,0.12)', borderWidth: 1, borderColor: 'rgba(255,49,49,0.35)', borderRadius: 12, height: 52 },
  logoutBtnText:{ fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#ff3131' },

  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  menuSheet:   { backgroundColor: '#2a2a2a', borderRadius: 14, padding: 24, width: '100%' },
  menuTitle:   { fontFamily: 'Oswald_700Bold', fontSize: 18, fontStyle: 'italic', color: '#ffffff', letterSpacing: 1, textAlign: 'center', marginBottom: 20 },
  menuItem:    { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  menuItemText:{ fontFamily: 'Montserrat_700Bold', fontSize: 15, fontWeight: '700', color: '#ffffff' },
});

export default ProfileScreen;