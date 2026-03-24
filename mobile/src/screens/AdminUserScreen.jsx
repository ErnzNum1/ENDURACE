import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ImageBackground, Dimensions, SafeAreaView, Modal,
  ActivityIndicator, Image, TextInput,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft, faUserCheck, faUserXmark,
  faMagnifyingGlass, faShield, faUser,
} from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loadAllUsers, toggleUserStatus, changeUserRole } from '../store/userSlice';
import { useAuth } from '../context/auth';
import PageHeader from '../components/PageHeader';

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const AdminUsersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user: currentUser, accessToken } = useAuth();
  const { list: users, loading } = useSelector((s) => s.users);

  const [search,        setSearch]        = useState('');
  const [confirmModal,  setConfirmModal]  = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  // { userId, type: 'status'|'role', value, name }

  useEffect(() => { dispatch(loadAllUsers(accessToken)); }, []);

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.firstName?.toLowerCase().includes(q) ||
      u.lastName?.toLowerCase().includes(q)  ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const openConfirm = (user, type, value) => {
    setConfirmAction({ userId: user._id, type, value, name: `${user.firstName} ${user.lastName}`, currentRole: user.role });
    setConfirmModal(true);
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { userId, type, value } = confirmAction;
    if (type === 'status') {
      await dispatch(toggleUserStatus({ userId, isActive: value, accessToken }));
    } else if (type === 'role') {
      await dispatch(changeUserRole({ userId, role: value, accessToken }));
    }
    setConfirmModal(false);
    setConfirmAction(null);
  };

  const renderItem = ({ item }) => {
    const isSelf    = item._id === currentUser?._id;
    const isAdmin   = item.role === 'admin';
    const avatarUri = item.avatar ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(item.firstName + ' ' + item.lastName)}&background=38b6ff&color=fff&size=80`;

    return (
      <View style={[styles.card, !item.isActive && styles.cardInactive]}>
        <Image source={{ uri: avatarUri }} style={styles.avatar} />

        <View style={styles.cardBody}>
          <View style={styles.nameRow}>
            <Text style={styles.userName} numberOfLines={1}>{item.firstName} {item.lastName}</Text>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <FontAwesomeIcon icon={faShield} size={9} color="#010101" />
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            )}
            {!item.isActive && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>INACTIVE</Text>
              </View>
            )}
          </View>
          <Text style={styles.userEmail} numberOfLines={1}>{item.email}</Text>
          <Text style={styles.userProvider}>{item.authProvider} account</Text>
        </View>

        {!isSelf && (
          <View style={styles.cardActions}>
            {/* Activate / Deactivate */}
            <TouchableOpacity
              style={[styles.actionBtn, item.isActive ? styles.deactivateBtn : styles.activateBtn]}
              onPress={() => openConfirm(item, 'status', !item.isActive)}
              activeOpacity={0.8}
            >
              <FontAwesomeIcon
                icon={item.isActive ? faUserXmark : faUserCheck}
                size={13}
                color="#ffffff"
              />
            </TouchableOpacity>

            {/* Promote / Demote role */}
            <TouchableOpacity
              style={[styles.actionBtn, isAdmin ? styles.demoteBtn : styles.promoteBtn]}
              onPress={() => openConfirm(item, 'role', isAdmin ? 'user' : 'admin')}
              activeOpacity={0.8}
            >
              <FontAwesomeIcon
                icon={isAdmin ? faUser : faShield}
                size={13}
                color="#010101"
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // Confirm modal labels
  const getConfirmLabel = () => {
    if (!confirmAction) return '';
    if (confirmAction.type === 'status') {
      return confirmAction.value
        ? `Activate account for ${confirmAction.name}?`
        : `Deactivate account for ${confirmAction.name}?\n\nThis user will no longer be able to log in.`;
    }
    const newRole = confirmAction.value;
    return newRole === 'admin'
      ? `Promote ${confirmAction.name} to Admin?\n\nThey will gain full admin panel access.`
      : `Demote ${confirmAction.name} to User?\n\nThey will lose admin panel access.`;
  };

  const getConfirmColor = () => {
    if (!confirmAction) return '#ffde59';
    if (confirmAction.type === 'status') return confirmAction.value ? '#38b6ff' : '#ff3131';
    return confirmAction.value === 'admin' ? '#a855f7' : '#ff8800';
  };

  return (
    <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faChevronLeft} size={18} color="#ffffff" />
        </TouchableOpacity>

        <FlatList
          data={filtered}
          keyExtractor={(i) => i._id}
          ListHeaderComponent={
            <View>
              <PageHeader title="USERS" />
              <View style={styles.searchRow}>
                <View style={styles.searchContainer}>
                  <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color="rgba(255,255,255,0.6)" />
                  <TextInput
                    style={styles.searchInput}
                    value={search}
                    onChangeText={setSearch}
                    placeholder="Search users..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />
                </View>
              </View>
              <Text style={styles.countText}>{filtered.length} user{filtered.length !== 1 ? 's' : ''}</Text>
              {/* Legend */}
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#38b6ff' }]} />
                  <Text style={styles.legendText}>Activate</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ff3131' }]} />
                  <Text style={styles.legendText}>Deactivate</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#a855f7' }]} />
                  <Text style={styles.legendText}>Make Admin</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#ff8800' }]} />
                  <Text style={styles.legendText}>Make User</Text>
                </View>
              </View>
            </View>
          }
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={() => dispatch(loadAllUsers(accessToken))}
          refreshing={loading}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No users found.</Text>
              </View>
            ) : null
          }
        />
      </SafeAreaView>

      {/* Confirm modal */}
      <Modal visible={confirmModal} transparent animationType="fade" onRequestClose={() => setConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>CONFIRM ACTION</Text>
            <Text style={styles.modalMessage}>{getConfirmLabel()}</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmModal(false)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: getConfirmColor() }]}
                onPress={handleConfirm}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#ffffff" />
                  : <Text style={[
                      styles.confirmText,
                      getConfirmColor() === '#ffde59' && { color: '#010101' },
                      getConfirmColor() === '#a855f7' && { color: '#ffffff' },
                      getConfirmColor() === '#ff8800' && { color: '#ffffff' },
                    ]}>CONFIRM</Text>
                }
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
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  safe:    { flex: 1 },
  backBtn: {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', width: 38, height: 38,
    borderRadius: 19, alignItems: 'center', justifyContent: 'center',
  },
  listContent: { paddingBottom: 40, paddingTop: 60 },
  centered:    { alignItems: 'center', paddingTop: 40 },
  emptyText:   { fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  searchRow:   { paddingHorizontal: 12, marginBottom: 8 },
  searchContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)', borderRadius: 8,
    paddingHorizontal: 14, height: 46,
  },
  searchInput: { flex: 1, color: '#ffffff', fontSize: 14, fontFamily: 'Montserrat_400Regular' },
  countText:   { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)', paddingHorizontal: 16, marginBottom: 4 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16, marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontFamily: 'Montserrat_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.55)' },

  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginHorizontal: 12, marginVertical: 5, borderRadius: 10, padding: 12,
  },
  cardInactive: { opacity: 0.5 },
  avatar:    { width: 48, height: 48, borderRadius: 24 },
  cardBody:  { flex: 1 },
  nameRow:   { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 },
  userName:  { fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700', color: '#010101' },
  adminBadge:{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#ffde59', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  adminBadgeText:  { fontFamily: 'Montserrat_700Bold', fontSize: 9, fontWeight: '700', color: '#010101' },
  inactiveBadge:   { backgroundColor: '#ff3131', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  inactiveBadgeText:{ fontFamily: 'Montserrat_700Bold', fontSize: 9, fontWeight: '700', color: '#ffffff' },
  userEmail:    { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: '#3a3a3a', marginBottom: 2 },
  userProvider: { fontFamily: 'Montserrat_400Regular', fontSize: 10, color: '#888' },

  cardActions:  { flexDirection: 'column', gap: 6 },
  actionBtn:    { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  activateBtn:  { backgroundColor: '#38b6ff' },
  deactivateBtn:{ backgroundColor: '#ff3131' },
  promoteBtn:   { backgroundColor: '#a855f7' },
  demoteBtn:    { backgroundColor: '#ff8800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalBox:     { backgroundColor: '#2a2a2a', borderRadius: 12, padding: 24, width: '100%' },
  modalTitle:   { fontFamily: 'Oswald_700Bold', fontSize: 20, fontStyle: 'italic', color: '#ffffff', textAlign: 'center', letterSpacing: 1, marginBottom: 12 },
  modalMessage: { fontFamily: 'Montserrat_400Regular', fontSize: 14, color: '#cccccc', lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  modalBtnRow:  { flexDirection: 'row', gap: 12 },
  cancelBtn:    { flex: 1, backgroundColor: '#3a3a3a', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelText:   { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700', fontSize: 14 },
  confirmBtn:   { flex: 1, borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  confirmText:  { fontFamily: 'Montserrat_700Bold', fontWeight: '700', fontSize: 14, color: '#ffffff' },
});

export default AdminUsersScreen;