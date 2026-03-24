import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, Dimensions, SafeAreaView,
  FlatList, Image, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loadOrderById } from '../store/orderSlice';
import { useAuth } from '../context/auth';

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const ORDER_STATUS = {
  PENDING:   { label: 'Pending',   color: '#aaaaaa' },
  CANCELED:  { label: 'Canceled',  color: '#ff3131' },
  TO_SHIP:   { label: 'To Ship',   color: '#ffde59' },
  DELIVERED: { label: 'Delivered', color: '#38b6ff' },
};

const OrderInfoScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const { order: passedOrder, orderId } = route.params || {};
  const id = orderId || passedOrder?._id;
  const { selected: order, loading } = useSelector((s) => s.orders);

  useEffect(() => {
    if (id && accessToken) dispatch(loadOrderById({ id, accessToken }));
  }, [id, accessToken]);

  if (loading || !order) {
    return (
      <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.centered}><ActivityIndicator size="large" color="#ffffff" /></View>
      </ImageBackground>
    );
  }

  const status   = ORDER_STATUS[order.status] || ORDER_STATUS.PENDING;
  const isYellow = order.status === 'TO_SHIP';

  const renderOrderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemVariation}>Variation: {item.variation}</Text>
        <Text style={styles.itemPrice}>Price: Php. {item.price?.toLocaleString()}</Text>
        <View style={styles.itemBottomRow}>
          <View style={styles.qtyContainer}>
            <Text style={styles.qtyLabel}>Qty: </Text>
            <View style={styles.qtyBadge}>
              <Text style={styles.qtyText}>{item.quantity}</Text>
            </View>
          </View>
          <Text style={styles.itemTotal}>Php. {(item.price * item.quantity).toLocaleString()}</Text>
        </View>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      <View style={styles.infoCard}>
        <View style={styles.stripeRow}>
          <View style={[styles.stripe, { backgroundColor: '#ff3131' }]} />
          <View style={[styles.stripe, { backgroundColor: '#ffde59' }]} />
          <View style={[styles.stripe, { backgroundColor: '#38b6ff' }]} />
        </View>
        {[
          { label: 'Order ID',   value: order._id?.slice(-8).toUpperCase() },
          { label: 'Order Date', value: new Date(order.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) },
          { label: 'Payment',    value: order.paymentMethod },
        ].map(({ label, value }) => (
          <View key={label}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{label}</Text>
              <Text style={styles.infoValue}>{value}</Text>
            </View>
            <View style={styles.divider} />
          </View>
        ))}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.color }]}>
            <Text style={[styles.statusText, isYellow && { color: '#010101' }]}>{status.label}</Text>
          </View>
        </View>
        {order.shippingAddress?.address ? (
          <>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Ship to</Text>
              <Text style={[styles.infoValue, { textAlign: 'right', flex: 1, marginLeft: 16 }]} numberOfLines={3}>
                {order.shippingAddress.fullName}{'\n'}
                {order.shippingAddress.address}, {order.shippingAddress.city}{'\n'}
                {order.shippingAddress.phone}
              </Text>
            </View>
          </>
        ) : null}
        <View style={styles.divider} />
        {order.discountCode && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Discount</Text>
              <Text style={[styles.infoValue, { color: '#38b6ff' }]}>
                {order.discountCode} (−Php. {order.discountAmount?.toLocaleString()})
              </Text>
            </View>
            <View style={styles.divider} />
          </>
        )}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Order Total</Text>
          <Text style={[styles.infoValue, styles.totalValue]}>Php. {order.total?.toLocaleString()}</Text>
        </View>
      </View>
      <Text style={styles.sectionLabel}>Order Items</Text>
    </View>
  );

  return (
    <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faChevronLeft} size={18} color="#ffffff" />
        </TouchableOpacity>
        <FlatList
          data={order.items}
          keyExtractor={(item, i) => `${item.product || i}`}
          ListHeaderComponent={ListHeader}
          renderItem={renderOrderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:       { flex: 1, width, height },
  overlay:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  safe:     { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn:  { position: 'absolute', top: 56, left: 16, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: 40, paddingTop: 60 },
  infoCard:  { backgroundColor: 'rgba(255,255,255,0.92)', marginHorizontal: 12, marginBottom: 16, borderRadius: 10, overflow: 'hidden' },
  stripeRow: { height: 6, flexDirection: 'row' },
  stripe:    { flex: 1 },
  infoRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  infoLabel: { fontFamily: 'Montserrat_400Regular', fontSize: 13, color: '#3a3a3a' },
  infoValue: { fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700', color: '#010101' },
  totalValue:{ fontSize: 16 },
  divider:   { height: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginHorizontal: 16 },
  statusBadge:{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontFamily: 'Montserrat_700Bold', fontSize: 11, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
  sectionLabel:{ fontFamily: 'Oswald_700Bold', fontSize: 18, fontStyle: 'italic', color: '#ffffff', letterSpacing: 1, marginHorizontal: 16, marginBottom: 8 },
  itemCard:   { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.88)', marginHorizontal: 12, marginVertical: 6, borderRadius: 8, overflow: 'hidden' },
  itemImage:  { width: 100, height: 120, resizeMode: 'cover' },
  itemDetails:{ flex: 1, padding: 10, justifyContent: 'space-between' },
  itemName:   { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#010101', marginBottom: 2 },
  itemVariation:{ fontFamily: 'Montserrat_400Regular', fontSize: 11, color: '#3a3a3a' },
  itemPrice:  { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: '#3a3a3a', marginBottom: 6 },
  itemBottomRow:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyContainer: { flexDirection: 'row', alignItems: 'center' },
  qtyLabel:  { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#3a3a3a' },
  qtyBadge:  { backgroundColor: '#ffde59', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, minWidth: 26, alignItems: 'center' },
  qtyText:   { fontFamily: 'Montserrat_700Bold', fontSize: 12, fontWeight: '700', color: '#010101' },
  itemTotal: { fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700', color: '#010101' },
});

export default OrderInfoScreen;