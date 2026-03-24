import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ImageBackground, Dimensions,
  SafeAreaView, Modal, TouchableOpacity, Animated, ActivityIndicator,
  TextInput, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTag, faXmark, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateQuantity, removeFromCart, removeItems,
  selectCartItems, selectCartTotal,
} from '../store/cartSlice';
import { createOrder } from '../store/orderSlice';
import { validateCode, clearAppliedDiscount } from '../store/discountSlice';
import { useAuth } from '../context/auth';
import PageHeader from '../components/PageHeader';
import CartList from '../components/CartList';

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const CartScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { accessToken, user } = useAuth();

  const cartItems       = useSelector(selectCartItems);
  const hydrated        = useSelector((s) => s.cart.hydrated);
  const orderLoading    = useSelector((s) => s.orders.loading);
  const applied         = useSelector((s) => s.discounts.applied);
  const discountLoading = useSelector((s) => s.discounts.loading);
  const discountError   = useSelector((s) => s.discounts.error);

  const [checkedIds,           setCheckedIds]           = useState([]);
  const [removeModalVisible,   setRemoveModalVisible]   = useState(false);
  const [pendingRemoveItem,    setPendingRemoveItem]    = useState(null);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [checkoutStep,         setCheckoutStep]         = useState('summary');
  const [orderError,           setOrderError]           = useState('');
  const [discountInput,        setDiscountInput]        = useState('');

  const [fullName, setFullName] = useState(`${user?.firstName || ''} ${user?.lastName || ''}`.trim());
  const [address,  setAddress]  = useState('');
  const [city,     setCity]     = useState('');
  const [province, setProvince] = useState('');
  const [zipCode,  setZipCode]  = useState('');
  const [phone,    setPhone]    = useState('');

  const slideAnim = useRef(new Animated.Value(100)).current;

  const checkedItems = cartItems.filter((i) => checkedIds.includes(i.id));
  const rawTotal     = checkedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmt  = applied?.discountAmount || 0;
  const finalTotal   = Math.max(0, rawTotal - discountAmt);

  const showActionBar = (show) =>
    Animated.timing(slideAnim, { toValue: show ? 0 : 100, duration: 280, useNativeDriver: true }).start();

  useEffect(() => {
    const stillChecked = checkedIds.filter((id) => cartItems.some((i) => i.id === id));
    if (stillChecked.length !== checkedIds.length) {
      setCheckedIds(stillChecked);
      showActionBar(stillChecked.length > 0);
    }
  }, [cartItems]);

  useEffect(() => {
    if (!checkoutModalVisible) { dispatch(clearAppliedDiscount()); setDiscountInput(''); }
  }, [checkoutModalVisible]);

  const handleQuantityChange = (id, qty) => dispatch(updateQuantity({ id, quantity: qty }));
  const handleMinusAtOne     = (item) => { setPendingRemoveItem(item); setRemoveModalVisible(true); };
  const confirmRemoveSingle  = () => {
    if (pendingRemoveItem) { dispatch(removeFromCart(pendingRemoveItem.id)); setCheckedIds((prev) => prev.filter((id) => id !== pendingRemoveItem.id)); }
    setRemoveModalVisible(false); setPendingRemoveItem(null);
  };

  const handleCheckToggle = (id) => {
    setCheckedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id];
      showActionBar(next.length > 0);
      return next;
    });
  };

  const handleBatchRemove = () => { dispatch(removeItems(checkedIds)); setCheckedIds([]); showActionBar(false); };
  const handleSelectAll   = () => {
    if (checkedIds.length === cartItems.length) { setCheckedIds([]); showActionBar(false); }
    else { const allIds = cartItems.map((i) => i.id); setCheckedIds(allIds); showActionBar(allIds.length > 0); }
  };

  const handleApplyDiscount  = () => { if (!discountInput.trim()) return; dispatch(validateCode({ code: discountInput.trim(), orderTotal: rawTotal, accessToken })); };
  const handleRemoveDiscount = () => { dispatch(clearAppliedDiscount()); setDiscountInput(''); };

  const openCheckout = () => { setCheckoutStep('summary'); setOrderError(''); setCheckoutModalVisible(true); };

  const handlePlaceOrder = async () => {
    setOrderError('');
    if (!fullName.trim() || !address.trim() || !city.trim() || !phone.trim()) {
      return setOrderError('Please fill in all required shipping fields.');
    }
    const orderItems = checkedItems.map((item) => ({
      product: item.productId ?? item.id, name: item.name,
      variation: item.variation, price: item.price, quantity: item.quantity, image: item.image,
    }));
    try {
      await dispatch(createOrder({
        items: orderItems, total: finalTotal,
        shippingAddress: { fullName, address, city, province, zipCode, phone },
        paymentMethod: 'Cash on Delivery',
        discountCode: applied?.code || null,
        discountAmount: applied?.discountAmount || 0,
        accessToken,
      })).unwrap();
      dispatch(removeItems(checkedIds));
      setCheckedIds([]); showActionBar(false);
      setCheckoutStep('success');
    } catch (e) { setOrderError(e || 'Failed to place order. Please try again.'); }
  };

  const closeCheckoutModal = () => { setCheckoutModalVisible(false); if (checkoutStep === 'success') navigation.navigate('Orders'); };
  const allChecked = cartItems.length > 0 && checkedIds.length === cartItems.length;

  if (!hydrated) {
    return (
      <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.centered}><ActivityIndicator size="large" color="#ffffff" /></View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <View>
              <PageHeader title="CART" />
              {cartItems.length > 0 && (
                <TouchableOpacity style={styles.selectAllRow} onPress={handleSelectAll} activeOpacity={0.7}>
                  <View style={[styles.selectAllBox, allChecked && styles.selectAllBoxChecked]}>
                    {allChecked && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={styles.selectAllText}>{allChecked ? 'Deselect All' : 'Select All'}</Text>
                  <Text style={styles.cartCount}>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</Text>
                </TouchableOpacity>
              )}
            </View>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Your cart is empty.</Text>
              <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('Landing')} activeOpacity={0.85}>
                <Text style={styles.shopBtnText}>SHOP NOW</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <CartList
              item={item}
              onQuantityChange={handleQuantityChange}
              onMinusAtOne={handleMinusAtOne}
              checked={checkedIds.includes(item.id)}
              onCheckToggle={handleCheckToggle}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      {/* Sliding action bar */}
      {checkedIds.length > 0 && (
        <Animated.View style={[styles.actionBar, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.actionSummary}>
            <Text style={styles.actionSummaryLabel}>{checkedIds.length} selected</Text>
            <Text style={styles.actionSummaryTotal}>Php. {rawTotal.toLocaleString()}</Text>
          </View>
          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.removeBtn} onPress={handleBatchRemove} activeOpacity={0.85}>
              <Text style={styles.removeBtnText}>REMOVE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.checkoutBtn} onPress={openCheckout} activeOpacity={0.85}>
              <Text style={styles.checkoutBtnText}>CHECKOUT</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Remove single modal */}
      <Modal visible={removeModalVisible} transparent animationType="fade" onRequestClose={() => setRemoveModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>REMOVE ITEM</Text>
            <Text style={styles.modalMessage}>Remove <Text style={styles.modalHighlight}>{pendingRemoveItem?.name}</Text> from your cart?</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setRemoveModalVisible(false)}><Text style={styles.modalCancelText}>CANCEL</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalRemoveBtn} onPress={confirmRemoveSingle}><Text style={styles.modalActionText}>REMOVE</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Checkout modal */}
      <Modal visible={checkoutModalVisible} transparent animationType="slide" onRequestClose={closeCheckoutModal}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {checkoutStep === 'success' ? (
            <View style={styles.modalBox}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.modalTitle}>ORDER PLACED!</Text>
              <Text style={styles.modalMessage}>Your order has been placed. You'll receive updates via notification.</Text>
              <TouchableOpacity style={styles.modalConfirmBtn} onPress={closeCheckoutModal}><Text style={styles.modalActionText}>VIEW ORDERS</Text></TouchableOpacity>
            </View>
          ) : checkoutStep === 'summary' ? (
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>ORDER SUMMARY</Text>
              <ScrollView style={styles.summaryScroll} showsVerticalScrollIndicator={false}>
                {checkedItems.map((item) => (
                  <View key={item.id} style={styles.checkoutRow}>
                    <Text style={styles.checkoutItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.checkoutItemQty}>×{item.quantity}</Text>
                    <Text style={styles.checkoutItemPrice}>Php. {(item.price * item.quantity).toLocaleString()}</Text>
                  </View>
                ))}
              </ScrollView>

              {/* Discount code */}
              <View style={styles.discountSection}>
                <Text style={styles.discountLabel}><FontAwesomeIcon icon={faTag} size={12} color="#ffde59" />{'  '}DISCOUNT CODE</Text>
                {applied ? (
                  <View style={styles.appliedRow}>
                    <FontAwesomeIcon icon={faCheckCircle} size={16} color="#38b6ff" />
                    <View style={styles.appliedInfo}>
                      <Text style={styles.appliedCode}>{applied.code}</Text>
                      <Text style={styles.appliedSaving}>Saving Php. <Text style={styles.savingAmount}>{applied.discountAmount.toLocaleString()}</Text></Text>
                    </View>
                    <TouchableOpacity onPress={handleRemoveDiscount} style={styles.removeCodeBtn}>
                      <FontAwesomeIcon icon={faXmark} size={14} color="rgba(255,255,255,0.6)" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.codeInputRow}>
                    <TextInput style={styles.codeInput} value={discountInput} onChangeText={(t) => setDiscountInput(t.toUpperCase())} placeholder="Enter code" placeholderTextColor="#666" autoCapitalize="characters" />
                    <TouchableOpacity style={styles.applyCodeBtn} onPress={handleApplyDiscount} disabled={discountLoading || !discountInput.trim()} activeOpacity={0.8}>
                      {discountLoading ? <ActivityIndicator size="small" color="#010101" /> : <Text style={styles.applyCodeText}>APPLY</Text>}
                    </TouchableOpacity>
                  </View>
                )}
                {!!discountError && !applied && <Text style={styles.discountError}>{discountError}</Text>}
              </View>

              {/* Totals */}
              <View style={styles.totalsBlock}>
                <View style={styles.totalRow}><Text style={styles.totalRowLabel}>Subtotal</Text><Text style={styles.totalRowValue}>Php. {rawTotal.toLocaleString()}</Text></View>
                {!!discountAmt && (
                  <View style={styles.totalRow}><Text style={[styles.totalRowLabel, { color: '#38b6ff' }]}>Discount</Text><Text style={[styles.totalRowValue, { color: '#38b6ff' }]}>− Php. {discountAmt.toLocaleString()}</Text></View>
                )}
                <View style={styles.totalDivider} />
                <View style={styles.totalRow}><Text style={styles.grandTotalLabel}>TOTAL</Text><Text style={styles.grandTotalValue}>Php. {finalTotal.toLocaleString()}</Text></View>
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={closeCheckoutModal}><Text style={styles.modalCancelText}>CANCEL</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={() => setCheckoutStep('address')}><Text style={styles.modalActionText}>NEXT</Text></TouchableOpacity>
              </View>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.addressModalContainer} keyboardShouldPersistTaps="handled">
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>SHIPPING INFO</Text>
                {!!orderError && <View style={styles.errorBox}><Text style={styles.errorText}>{orderError}</Text></View>}
                {[
                  { label: 'Full Name *',   value: fullName,  setter: setFullName  },
                  { label: 'Address *',     value: address,   setter: setAddress   },
                  { label: 'City *',        value: city,      setter: setCity      },
                  { label: 'Province',      value: province,  setter: setProvince  },
                  { label: 'ZIP Code',      value: zipCode,   setter: setZipCode   },
                  { label: 'Phone Number *',value: phone,     setter: setPhone     },
                ].map(({ label, value, setter }) => (
                  <View key={label}>
                    <Text style={styles.inputLabel}>{label}</Text>
                    <TextInput style={styles.input} value={value} onChangeText={setter} placeholderTextColor="#666" placeholder={label.replace(' *', '')} />
                  </View>
                ))}
                <View style={[styles.totalsBlock, { marginTop: 16 }]}>
                  <View style={styles.totalRow}><Text style={styles.grandTotalLabel}>ORDER TOTAL</Text><Text style={styles.grandTotalValue}>Php. {finalTotal.toLocaleString()}</Text></View>
                </View>
                <View style={styles.modalBtnRow}>
                  <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setCheckoutStep('summary')}><Text style={styles.modalCancelText}>BACK</Text></TouchableOpacity>
                  <TouchableOpacity style={styles.modalConfirmBtn} onPress={handlePlaceOrder} disabled={orderLoading}>
                    {orderLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.modalActionText}>PLACE ORDER</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:      { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  safe:    { flex: 1 },
  centered:{ flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { paddingBottom: 120, paddingTop: 8 },
  selectAllRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, gap: 10 },
  selectAllBox:       { width: 20, height: 20, borderRadius: 4, borderWidth: 2, borderColor: '#ffffff', alignItems: 'center', justifyContent: 'center' },
  selectAllBoxChecked:{ backgroundColor: '#ffffff' },
  checkMark:          { fontSize: 12, color: '#010101', fontWeight: '700' },
  selectAllText:      { fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#ffffff', flex: 1 },
  cartCount:          { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  emptyContainer:{ alignItems: 'center', paddingTop: 80, gap: 16 },
  emptyText:     { fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', fontSize: 15 },
  shopBtn:       { backgroundColor: '#ffffff', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 6 },
  shopBtnText:   { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#010101', letterSpacing: 1 },
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(1,1,1,0.95)', paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', gap: 8,
  },
  actionSummary:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  actionSummaryLabel: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  actionSummaryTotal: { fontFamily: 'Montserrat_700Bold', fontSize: 15, fontWeight: '700', color: '#ffffff' },
  actionBtns:         { flexDirection: 'row', gap: 12 },
  removeBtn:          { flex: 1, backgroundColor: '#ff3131', borderRadius: 8, height: 48, alignItems: 'center', justifyContent: 'center' },
  removeBtnText:      { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#ffffff', letterSpacing: 1 },
  checkoutBtn:        { flex: 1, backgroundColor: '#ffffff', borderRadius: 8, height: 48, alignItems: 'center', justifyContent: 'center' },
  checkoutBtnText:    { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#010101', letterSpacing: 1 },
  modalOverlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  addressModalContainer:{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 40 },
  modalBox:    { backgroundColor: '#2a2a2a', borderRadius: 12, padding: 24, width: '100%' },
  successEmoji:{ fontSize: 40, textAlign: 'center', marginBottom: 8 },
  modalTitle:  { fontFamily: 'Oswald_700Bold', fontSize: 22, fontStyle: 'italic', color: '#ffffff', marginBottom: 12, textAlign: 'center', letterSpacing: 1 },
  modalMessage:{ fontFamily: 'Montserrat_400Regular', fontSize: 14, color: '#cccccc', lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  modalHighlight:{ fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700' },
  summaryScroll:      { maxHeight: 150, marginBottom: 12 },
  checkoutRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  checkoutItemName:   { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#cccccc', flex: 1 },
  checkoutItemQty:    { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#888' },
  checkoutItemPrice:  { fontFamily: 'Montserrat_700Bold', fontSize: 12, fontWeight: '700', color: '#ffffff' },
  discountSection:    { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 14, marginBottom: 14 },
  discountLabel:      { fontFamily: 'Montserrat_700Bold', fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 1, marginBottom: 10 },
  codeInputRow:       { flexDirection: 'row', gap: 8 },
  codeInput:          { flex: 1, backgroundColor: '#3a3a3a', borderWidth: 1, borderColor: '#555', borderRadius: 6, height: 44, paddingHorizontal: 12, color: '#ffffff', fontSize: 14, fontFamily: 'Montserrat_700Bold', letterSpacing: 1 },
  applyCodeBtn:       { backgroundColor: '#ffde59', borderRadius: 6, height: 44, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center', minWidth: 70 },
  applyCodeText:      { fontFamily: 'Montserrat_700Bold', fontSize: 12, fontWeight: '700', color: '#010101', letterSpacing: 1 },
  discountError:      { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#ff3131', marginTop: 6 },
  appliedRow:         { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(56,182,255,0.1)', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: 'rgba(56,182,255,0.3)' },
  appliedInfo:        { flex: 1 },
  appliedCode:        { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#ffffff', letterSpacing: 1 },
  appliedSaving:      { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  savingAmount:       { fontFamily: 'Montserrat_700Bold', color: '#38b6ff', fontWeight: '700' },
  removeCodeBtn:      { padding: 4 },
  totalsBlock:        { backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: 12, gap: 8 },
  totalRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalRowLabel:      { fontFamily: 'Montserrat_400Regular', fontSize: 13, color: '#cccccc' },
  totalRowValue:      { fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700', color: '#ffffff' },
  totalDivider:       { height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
  grandTotalLabel:    { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#ffffff' },
  grandTotalValue:    { fontFamily: 'Montserrat_700Bold', fontSize: 16, fontWeight: '700', color: '#ffde59' },
  errorBox:   { backgroundColor: 'rgba(255,49,49,0.15)', borderWidth: 1, borderColor: '#ff3131', borderRadius: 6, padding: 10, marginBottom: 12 },
  errorText:  { fontFamily: 'Montserrat_400Regular', color: '#ff3131', fontSize: 12 },
  inputLabel: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#cccccc', marginTop: 10, marginBottom: 4 },
  input:      { backgroundColor: '#3a3a3a', borderWidth: 1, borderColor: '#555', borderRadius: 6, height: 44, paddingHorizontal: 12, color: '#ffffff', fontSize: 14 },
  modalBtnRow:     { flexDirection: 'row', gap: 12, marginTop: 20 },
  modalCancelBtn:  { flex: 1, backgroundColor: '#3a3a3a', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700', fontSize: 14 },
  modalRemoveBtn:  { flex: 1, backgroundColor: '#ff3131', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  modalConfirmBtn: { flex: 1, backgroundColor: '#38b6ff', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  modalActionText: { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
});

export default CartScreen;