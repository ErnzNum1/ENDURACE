import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, Dimensions,
  SafeAreaView, FlatList, TouchableOpacity, ActivityIndicator, Modal,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loadMyOrders } from '../store/orderSlice';
import { useAuth } from '../context/auth';
import PageHeader from '../components/PageHeader';
import ReviewFormModal from '../components/ReviewFormModal';

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const ORDER_STATUS = {
  PENDING:   { label: 'Pending',   color: '#aaaaaa' },
  CANCELED:  { label: 'Canceled',  color: '#ff3131' },
  TO_SHIP:   { label: 'To Ship',   color: '#ffde59' },
  DELIVERED: { label: 'Delivered', color: '#38b6ff' },
};

// Picker for multi-item orders
const ProductPickerModal = ({ visible, order, onSelect, onClose }) => {
  if (!order) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.pickerBackdrop}>
        <View style={styles.pickerSheet}>
          <Text style={styles.pickerTitle}>SELECT PRODUCT TO REVIEW</Text>
          {order.items?.map((item, idx) => {
            const productId = item.product?._id?.toString() || item.product?.toString() || String(item.product);
            return (
              <TouchableOpacity
                key={idx}
                style={styles.pickerItem}
                onPress={() => onSelect({ productId, orderId: order._id.toString(), productName: item.name })}
                activeOpacity={0.8}
              >
                <Text style={styles.pickerItemText} numberOfLines={2}>{item.name}</Text>
                <FontAwesomeIcon icon={faChevronRight} size={14} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity style={styles.pickerCancel} onPress={onClose}>
            <Text style={styles.pickerCancelText}>CANCEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const OrdersScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const { myOrders, loading } = useSelector((s) => s.orders);

  const [reviewModal,   setReviewModal]   = useState(false);
  const [pickerModal,   setPickerModal]   = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewProduct, setReviewProduct] = useState(null);

  useEffect(() => {
    if (accessToken) dispatch(loadMyOrders(accessToken));
  }, [accessToken]);

  const handleReviewPress = (order) => {
    if (!order.items?.length) return;
    if (order.items.length === 1) {
      const item = order.items[0];
      const productId = item.product?._id?.toString() || item.product?.toString() || String(item.product);
      setReviewProduct({ productId, orderId: order._id.toString(), productName: item.name });
      setReviewModal(true);
    } else {
      setSelectedOrder(order);
      setPickerModal(true);
    }
  };

  const handleProductSelect = (product) => {
    setPickerModal(false);
    setSelectedOrder(null);
    setReviewProduct(product);
    setReviewModal(true);
  };

  const renderOrderItem = ({ item }) => {
    const status    = ORDER_STATUS[item.status] || ORDER_STATUS.PENDING;
    const isYellow  = item.status === 'TO_SHIP';
    const delivered = item.status === 'DELIVERED';

    return (
      <TouchableOpacity
        style={styles.orderCard}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('OrderInfo', { orderId: item._id })}
      >
        <View style={styles.orderTopRow}>
          <Text style={styles.orderId}>{item._id?.slice(-8).toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={[styles.statusText, isYellow && { color: '#010101' }]}>{status.label}</Text>
          </View>
        </View>
        <View style={styles.orderBottomRow}>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          <Text style={styles.orderTotal}>Php. {item.total?.toLocaleString()}</Text>
        </View>
        <Text style={styles.itemCount}>{item.items?.length || 0} item{(item.items?.length || 0) !== 1 ? 's' : ''}</Text>
        {delivered && (
          <TouchableOpacity style={styles.reviewBtn} onPress={() => handleReviewPress(item)} activeOpacity={0.85}>
            <Text style={styles.reviewBtnText}>✍  WRITE A REVIEW</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        {loading ? (
          <View style={styles.centered}><ActivityIndicator size="large" color="#ffffff" /></View>
        ) : (
          <FlatList
            data={myOrders}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={<PageHeader title="ORDERS" />}
            renderItem={renderOrderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={() => dispatch(loadMyOrders(accessToken))}
            refreshing={loading}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>You have no orders yet.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      <ProductPickerModal
        visible={pickerModal}
        order={selectedOrder}
        onSelect={handleProductSelect}
        onClose={() => { setPickerModal(false); setSelectedOrder(null); }}
      />

      {reviewProduct && (
        <ReviewFormModal
          visible={reviewModal}
          onClose={() => { setReviewModal(false); setReviewProduct(null); }}
          productId={reviewProduct.productId}
          orderId={reviewProduct.orderId}
        />
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:      { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  safe:    { flex: 1 },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText:{ fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  listContent: { paddingBottom: 40, paddingTop: 8 },
  orderCard: { backgroundColor: 'rgba(255,255,255,0.88)', marginHorizontal: 12, marginVertical: 6, borderRadius: 10, padding: 14 },
  orderTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId:     { fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700', color: '#010101' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText:  { fontFamily: 'Montserrat_700Bold', fontSize: 11, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
  orderBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderDate:   { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#3a3a3a' },
  orderTotal:  { fontFamily: 'Montserrat_700Bold', fontSize: 15, fontWeight: '700', color: '#010101' },
  itemCount:   { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: '#777', marginBottom: 4 },
  reviewBtn:   { marginTop: 10, backgroundColor: '#010101', paddingVertical: 10, borderRadius: 6, alignItems: 'center' },
  reviewBtnText:{ fontFamily: 'Montserrat_700Bold', fontSize: 12, fontWeight: '700', color: '#ffde59', letterSpacing: 1 },
  pickerBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  pickerSheet:    { backgroundColor: '#1e1e1e', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  pickerTitle:    { fontFamily: 'Oswald_700Bold', fontSize: 18, fontStyle: 'italic', color: '#ffffff', letterSpacing: 1, marginBottom: 16, textAlign: 'center' },
  pickerItem:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  pickerItemText: { fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#ffffff', fontWeight: '700', flex: 1, marginRight: 10 },
  pickerCancel:   { marginTop: 16, height: 48, backgroundColor: '#3a3a3a', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pickerCancelText:{ fontFamily: 'Montserrat_700Bold', fontSize: 14, color: '#ffffff', fontWeight: '700' },
});

export default OrdersScreen;