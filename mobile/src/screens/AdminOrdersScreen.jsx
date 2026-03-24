import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ImageBackground, Dimensions, SafeAreaView, Modal, ActivityIndicator,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loadAllOrders, changeOrderStatus } from '../store/orderSlice';
import { useAuth } from '../context/auth';
import PageHeader from '../components/PageHeader';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const STATUS_OPTIONS = ['PENDING', 'TO_SHIP', 'DELIVERED', 'CANCELED'];

const STATUS_META = {
  PENDING:   { label: 'Pending',   color: '#aaaaaa', textColor: '#ffffff' },
  TO_SHIP:   { label: 'To Ship',   color: '#ffde59', textColor: '#010101' },
  DELIVERED: { label: 'Delivered', color: '#38b6ff', textColor: '#ffffff' },
  CANCELED:  { label: 'Canceled',  color: '#ff3131', textColor: '#ffffff' },
};

const AdminOrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const { allOrders, loading } = useSelector((s) => s.orders);

  const [statusTarget, setStatusTarget] = useState(null);  // { order, newStatus }
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [dropdownOrderId, setDropdownOrderId] = useState(null);

  useEffect(() => {
    if (accessToken) dispatch(loadAllOrders(accessToken));
  }, [accessToken]);

  const openStatusPicker = (order) => {
    setDropdownOrderId(dropdownOrderId === order._id ? null : order._id);
  };

  const selectStatus = (order, newStatus) => {
    setDropdownOrderId(null);
    if (newStatus === order.status) return;
    setStatusTarget({ order, newStatus });
    setConfirmVisible(true);
  };

  const confirmStatusUpdate = async () => {
    if (!statusTarget) return;
    await dispatch(
      changeOrderStatus({ id: statusTarget.order._id, status: statusTarget.newStatus, accessToken })
    );
    setConfirmVisible(false);
    setStatusTarget(null);
  };

  const renderItem = ({ item }) => {
    const meta = STATUS_META[item.status] || STATUS_META.PENDING;
    const isDropdownOpen = dropdownOrderId === item._id;

    return (
      <View style={styles.card}>
        {/* Top row: order ID + customer */}
        <View style={styles.cardTop}>
          <Text style={styles.orderId}>{item._id?.slice(-8).toUpperCase()}</Text>
          <Text style={styles.customerName} numberOfLines={1}>
            {item.user?.firstName} {item.user?.lastName}
          </Text>
        </View>

        {/* Middle row: date + total */}
        <View style={styles.cardMid}>
          <Text style={styles.cardDate}>
            {new Date(item.createdAt).toLocaleDateString('en-PH', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </Text>
          <Text style={styles.cardTotal}>Php. {item.total?.toLocaleString()}</Text>
        </View>

        {/* Status picker */}
        <TouchableOpacity
          style={[styles.statusBtn, { backgroundColor: meta.color }]}
          onPress={() => openStatusPicker(item)}
          activeOpacity={0.8}
        >
          <Text style={[styles.statusBtnText, { color: meta.textColor }]}>{meta.label}</Text>
          <FontAwesomeIcon icon={faChevronDown} size={12} color={meta.textColor} />
        </TouchableOpacity>

        {/* Dropdown */}
        {isDropdownOpen && (
          <View style={styles.dropdown}>
            {STATUS_OPTIONS.map((s) => {
              const sm = STATUS_META[s];
              return (
                <TouchableOpacity
                  key={s}
                  style={[
                    styles.dropdownItem,
                    item.status === s && styles.dropdownItemActive,
                  ]}
                  onPress={() => selectStatus(item, s)}
                >
                  <View style={[styles.dropdownDot, { backgroundColor: sm.color }]} />
                  <Text style={styles.dropdownText}>{sm.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <ImageBackground source={{ uri: BG_IMAGE }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faChevronLeft} size={18} color="#ffffff" />
        </TouchableOpacity>

        {loading && allOrders.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : (
          <FlatList
            data={allOrders}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={<PageHeader title="ALL ORDERS" />}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={() => dispatch(loadAllOrders(accessToken))}
            refreshing={loading}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No orders yet.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* Confirm status change modal */}
      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>UPDATE STATUS</Text>
            <Text style={styles.modalMessage}>
              Change order{' '}
              <Text style={styles.modalHighlight}>
                {statusTarget?.order._id?.slice(-8).toUpperCase()}
              </Text>{' '}
              to{' '}
              <Text style={[styles.modalHighlight, { color: STATUS_META[statusTarget?.newStatus]?.color }]}>
                {STATUS_META[statusTarget?.newStatus]?.label}
              </Text>
              ?{'\n\n'}A push notification will be sent to the customer.
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmVisible(false)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmBtn}
                onPress={confirmStatusUpdate}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#010101" />
                  : <Text style={styles.confirmText}>CONFIRM</Text>
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
  bg: { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  safeArea: { flex: 1 },
  backBtn: {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', width: 38, height: 38,
    borderRadius: 19, alignItems: 'center', justifyContent: 'center',
  },
  listContent: { paddingBottom: 40, paddingTop: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: { fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', fontSize: 14 },

  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginHorizontal: 12, marginVertical: 6, borderRadius: 10, padding: 14,
    overflow: 'visible',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#010101' },
  customerName: { fontFamily: 'Montserrat_400Regular', fontSize: 13, color: '#3a3a3a', flex: 1, textAlign: 'right', marginLeft: 8 },
  cardMid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardDate: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#555' },
  cardTotal: { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#010101' },

  statusBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 36, borderRadius: 6, paddingHorizontal: 14,
  },
  statusBtnText: { fontFamily: 'Montserrat_700Bold', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },

  dropdown: {
    backgroundColor: '#1e1e1e', borderRadius: 8, marginTop: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden',
  },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12 },
  dropdownItemActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  dropdownDot: { width: 10, height: 10, borderRadius: 5 },
  dropdownText: { fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#ffffff', fontWeight: '700' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalBox: { backgroundColor: '#2a2a2a', borderRadius: 12, padding: 24, width: '100%' },
  modalTitle: { fontFamily: 'Oswald_700Bold', fontSize: 22, fontStyle: 'italic', color: '#ffffff', textAlign: 'center', letterSpacing: 1, marginBottom: 12 },
  modalMessage: { fontFamily: 'Montserrat_400Regular', fontSize: 14, color: '#cccccc', lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  modalHighlight: { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700' },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#3a3a3a', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelText: { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700', fontSize: 14 },
  confirmBtn: { flex: 1, backgroundColor: '#ffde59', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontFamily: 'Montserrat_700Bold', color: '#010101', fontWeight: '700', fontSize: 14 },
});

export default AdminOrdersScreen;