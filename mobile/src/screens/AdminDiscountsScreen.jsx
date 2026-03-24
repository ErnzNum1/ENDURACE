import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ImageBackground, Dimensions, SafeAreaView, Modal,
  TextInput, ActivityIndicator, ScrollView, Switch,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft, faPlus, faPenToSquare,
  faTrash, faBell, faTag,
} from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  loadAdminDiscounts, addDiscount, editDiscount,
  removeDiscount, sendPromoNotification,
  clearBroadcastResult, clearDiscountError,
} from '../store/discountSlice';
import { useAuth } from '../context/auth';
import PageHeader from '../components/PageHeader';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const EMPTY_FORM = {
  code: '', description: '', type: 'PERCENTAGE', value: '',
  minimumOrder: '', usageLimit: '', expiresAt: '', isActive: true,
};

const AdminDiscountsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const { list, loading, error, broadcastResult } = useSelector((s) => s.discounts);

  const [formModal,    setFormModal]    = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [promoModal,   setPromoModal]   = useState(false);
  const [editTarget,   setEditTarget]   = useState(null); // null = create

  const [form, setForm] = useState(EMPTY_FORM);

  // Promo broadcast fields
  const [promoTitle,   setPromoTitle]   = useState('');
  const [promoBody,    setPromoBody]    = useState('');
  const [promoCode,    setPromoCode]    = useState('');

  useEffect(() => {
    dispatch(loadAdminDiscounts(accessToken));
  }, []);

  // Auto-close broadcast modal on success
  useEffect(() => {
    if (broadcastResult) {
      const t = setTimeout(() => {
        dispatch(clearBroadcastResult());
        setPromoModal(false);
        setPromoTitle(''); setPromoBody(''); setPromoCode('');
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [broadcastResult]);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    dispatch(clearDiscountError());
    setFormModal(true);
  };

  const openEdit = (discount) => {
    setEditTarget(discount);
    setForm({
      code:         discount.code,
      description:  discount.description || '',
      type:         discount.type,
      value:        String(discount.value),
      minimumOrder: String(discount.minimumOrder || ''),
      usageLimit:   discount.usageLimit != null ? String(discount.usageLimit) : '',
      expiresAt:    discount.expiresAt
        ? new Date(discount.expiresAt).toISOString().split('T')[0]
        : '',
      isActive:     discount.isActive,
    });
    dispatch(clearDiscountError());
    setFormModal(true);
  };

  const handleSaveForm = async () => {
    if (!form.code || !form.value) return;
    const payload = {
      code:         form.code.toUpperCase().trim(),
      description:  form.description.trim(),
      type:         form.type,
      value:        Number(form.value),
      minimumOrder: form.minimumOrder ? Number(form.minimumOrder) : 0,
      usageLimit:   form.usageLimit   ? Number(form.usageLimit)   : null,
      expiresAt:    form.expiresAt    || null,
      isActive:     form.isActive,
    };

    if (editTarget) {
      await dispatch(editDiscount({ id: editTarget._id, payload, accessToken })).unwrap();
    } else {
      await dispatch(addDiscount({ payload, accessToken })).unwrap();
    }
    setFormModal(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(removeDiscount({ id: deleteTarget._id, accessToken }));
    setDeleteTarget(null);
  };

  const handleBroadcast = () => {
    if (!promoTitle.trim() || !promoBody.trim()) return;
    dispatch(sendPromoNotification({
      title: promoTitle.trim(),
      body:  promoBody.trim(),
      discountCode: promoCode.trim().toUpperCase() || null,
      accessToken,
    }));
  };

  const renderItem = ({ item }) => {
    const isExpired = item.expiresAt && new Date() > new Date(item.expiresAt);
    return (
      <View style={[styles.card, (!item.isActive || isExpired) && styles.cardInactive]}>
        <View style={styles.cardLeft}>
          <View style={styles.codeBadge}>
            <FontAwesomeIcon icon={faTag} size={11} color="#ffde59" />
            <Text style={styles.codeText}>{item.code}</Text>
          </View>
          <Text style={styles.discountValue}>
            {item.type === 'PERCENTAGE' ? `${item.value}%` : `Php. ${item.value.toLocaleString()}`} off
          </Text>
          {item.description ? (
            <Text style={styles.cardDesc} numberOfLines={1}>{item.description}</Text>
          ) : null}
          <View style={styles.cardMeta}>
            {item.minimumOrder > 0 && (
              <Text style={styles.metaChip}>Min: Php. {item.minimumOrder.toLocaleString()}</Text>
            )}
            {item.usageLimit != null && (
              <Text style={styles.metaChip}>{item.usageCount}/{item.usageLimit} used</Text>
            )}
            {isExpired && <Text style={[styles.metaChip, { backgroundColor: '#ff3131' }]}>Expired</Text>}
            {!item.isActive && <Text style={[styles.metaChip, { backgroundColor: '#555' }]}>Inactive</Text>}
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
            <FontAwesomeIcon icon={faPenToSquare} size={14} color="#010101" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(item)}>
            <FontAwesomeIcon icon={faTrash} size={14} color="#ffffff" />
          </TouchableOpacity>
        </View>
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

        <FlatList
          data={list}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={<PageHeader title="DISCOUNTS" />}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={() => dispatch(loadAdminDiscounts(accessToken))}
          refreshing={loading}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No discount codes yet.</Text>
              </View>
            ) : null
          }
        />

        {/* Broadcast promo FAB */}
        <TouchableOpacity
          style={styles.promoFab}
          onPress={() => { dispatch(clearBroadcastResult()); setPromoModal(true); }}
          activeOpacity={0.85}
        >
          <FontAwesomeIcon icon={faBell} size={20} color="#010101" />
        </TouchableOpacity>

        {/* Add discount FAB */}
        <TouchableOpacity style={styles.fab} onPress={openCreate} activeOpacity={0.85}>
          <FontAwesomeIcon icon={faPlus} size={22} color="#010101" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* ══ DISCOUNT FORM MODAL ════════════════════════════════════ */}
      <Modal visible={formModal} transparent animationType="slide" onRequestClose={() => setFormModal(false)}>
        <View style={styles.modalBackdrop}>
          <ScrollView contentContainerStyle={styles.formScrollContainer} keyboardShouldPersistTaps="handled">
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>
                {editTarget ? 'EDIT DISCOUNT' : 'NEW DISCOUNT'}
              </Text>

              {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

              <Text style={styles.inputLabel}>Code *</Text>
              <TextInput
                style={styles.input}
                value={form.code}
                onChangeText={(t) => setForm({ ...form, code: t.toUpperCase() })}
                autoCapitalize="characters"
                placeholderTextColor="#666"
                placeholder="e.g. ENDURE20"
                editable={!editTarget} // code immutable after creation
              />

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.input}
                value={form.description}
                onChangeText={(t) => setForm({ ...form, description: t })}
                placeholderTextColor="#666"
                placeholder="Summer sale 20% off"
              />

              {/* Type selector */}
              <Text style={styles.inputLabel}>Type *</Text>
              <View style={styles.typeRow}>
                {['PERCENTAGE', 'FLAT'].map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, form.type === t && styles.typeBtnActive]}
                    onPress={() => setForm({ ...form, type: t })}
                  >
                    <Text style={[styles.typeBtnText, form.type === t && styles.typeBtnTextActive]}>
                      {t === 'PERCENTAGE' ? '% Off' : 'Flat (Php)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>
                Value * {form.type === 'PERCENTAGE' ? '(0–100)' : '(peso amount)'}
              </Text>
              <TextInput
                style={styles.input}
                value={form.value}
                onChangeText={(t) => setForm({ ...form, value: t })}
                keyboardType="numeric"
                placeholderTextColor="#666"
                placeholder={form.type === 'PERCENTAGE' ? '20' : '500'}
              />

              <View style={styles.halfRow}>
                <View style={styles.halfField}>
                  <Text style={styles.inputLabel}>Min. Order (Php)</Text>
                  <TextInput
                    style={styles.input}
                    value={form.minimumOrder}
                    onChangeText={(t) => setForm({ ...form, minimumOrder: t })}
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                    placeholder="0"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.inputLabel}>Usage Limit</Text>
                  <TextInput
                    style={styles.input}
                    value={form.usageLimit}
                    onChangeText={(t) => setForm({ ...form, usageLimit: t })}
                    keyboardType="numeric"
                    placeholderTextColor="#666"
                    placeholder="Unlimited"
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Expires (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={form.expiresAt}
                onChangeText={(t) => setForm({ ...form, expiresAt: t })}
                placeholderTextColor="#666"
                placeholder="2026-12-31"
              />

              <View style={styles.toggleRow}>
                <Text style={styles.toggleLabel}>Active</Text>
                <Switch
                  value={form.isActive}
                  onValueChange={(v) => setForm({ ...form, isActive: v })}
                  trackColor={{ false: '#3a3a3a', true: '#38b6ff' }}
                  thumbColor="#ffffff"
                />
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setFormModal(false)}>
                  <Text style={styles.cancelText}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={handleSaveForm} disabled={loading}>
                  {loading
                    ? <ActivityIndicator color="#010101" />
                    : <Text style={styles.saveBtnText}>{editTarget ? 'SAVE' : 'CREATE'}</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ══ DELETE CONFIRM MODAL ════════════════════════════════════ */}
      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.centeredOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>DELETE CODE</Text>
            <Text style={styles.modalMessage}>
              Delete discount code{' '}
              <Text style={styles.modalHighlight}>{deleteTarget?.code}</Text>
              ? This cannot be undone.
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteTarget(null)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteConfirmBtn} onPress={handleDelete} disabled={loading}>
                {loading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.deleteConfirmText}>DELETE</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ══ PROMO BROADCAST MODAL (Quiz 2) ══════════════════════════ */}
      <Modal visible={promoModal} transparent animationType="slide" onRequestClose={() => setPromoModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={{ ...StyleSheet.flatten(styles.modalBox), marginHorizontal: 20 }}>
            <Text style={styles.modalTitle}>BROADCAST PROMO</Text>
            <Text style={styles.modalSubtitle}>
              Send a push notification to all users with a device token.
            </Text>

            {broadcastResult ? (
              <View style={styles.broadcastSuccess}>
                <Text style={styles.broadcastSuccessText}>
                  ✓ Sent to {broadcastResult.sent} user{broadcastResult.sent !== 1 ? 's' : ''}!
                </Text>
              </View>
            ) : (
              <>
                {!!error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}

                <Text style={styles.inputLabel}>Notification Title *</Text>
                <TextInput
                  style={styles.input}
                  value={promoTitle}
                  onChangeText={setPromoTitle}
                  placeholderTextColor="#666"
                  placeholder="🔥 Flash Sale!"
                />

                <Text style={styles.inputLabel}>Message *</Text>
                <TextInput
                  style={[styles.input, { height: 80, paddingTop: 10 }]}
                  value={promoBody}
                  onChangeText={setPromoBody}
                  placeholderTextColor="#666"
                  placeholder="Use code SUMMER20 for 20% off all orders!"
                  multiline
                  textAlignVertical="top"
                />

                <Text style={styles.inputLabel}>Discount Code (optional)</Text>
                <TextInput
                  style={styles.input}
                  value={promoCode}
                  onChangeText={(t) => setPromoCode(t.toUpperCase())}
                  autoCapitalize="characters"
                  placeholderTextColor="#666"
                  placeholder="SUMMER20"
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setPromoModal(false)}>
                    <Text style={styles.cancelText}>CANCEL</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.broadcastBtn}
                    onPress={handleBroadcast}
                    disabled={loading || !promoTitle.trim() || !promoBody.trim()}
                  >
                    {loading
                      ? <ActivityIndicator color="#ffffff" />
                      : <Text style={styles.broadcastBtnText}>SEND</Text>
                    }
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:      { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  safeArea:{ flex: 1 },
  backBtn: {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', width: 38, height: 38,
    borderRadius: 19, alignItems: 'center', justifyContent: 'center',
  },
  listContent: { paddingBottom: 140, paddingTop: 60 },
  centered:    { alignItems: 'center', paddingTop: 40 },
  emptyText:   { fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', fontSize: 14 },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginHorizontal: 12, marginVertical: 6, borderRadius: 10, padding: 14,
  },
  cardInactive: { opacity: 0.55 },
  cardLeft:   { flex: 1 },
  codeBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  codeText:   { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#010101', letterSpacing: 1 },
  discountValue:{ fontFamily: 'Oswald_700Bold', fontSize: 20, fontStyle: 'italic', color: '#010101', marginBottom: 2 },
  cardDesc:   { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#555', marginBottom: 6 },
  cardMeta:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip:   { backgroundColor: '#3a3a3a', color: '#ffffff', fontFamily: 'Montserrat_700Bold', fontSize: 10, fontWeight: '700', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  cardActions:{ flexDirection: 'column', gap: 8 },
  editBtn:    { backgroundColor: '#ffde59', width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deleteBtn:  { backgroundColor: '#ff3131', width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  fab: {
    position: 'absolute', bottom: 30, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6,
  },
  promoFab: {
    position: 'absolute', bottom: 30, right: 90, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#ffde59', alignItems: 'center', justifyContent: 'center',
    elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6,
  },

  // Modals
  modalBackdrop:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  centeredOverlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  formScrollContainer: { flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 10 },
  modalBox:            { backgroundColor: '#2a2a2a', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle:          { fontFamily: 'Oswald_700Bold', fontSize: 20, fontStyle: 'italic', color: '#ffffff', textAlign: 'center', letterSpacing: 1, marginBottom: 6 },
  modalSubtitle:       { fontFamily: 'Montserrat_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center', marginBottom: 16, lineHeight: 20 },
  modalMessage:        { fontFamily: 'Montserrat_400Regular', fontSize: 14, color: '#cccccc', lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  modalHighlight:      { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700' },
  errorBox:   { backgroundColor: 'rgba(255,49,49,0.15)', borderWidth: 1, borderColor: '#ff3131', borderRadius: 6, padding: 10, marginBottom: 12 },
  errorText:  { fontFamily: 'Montserrat_400Regular', color: '#ff3131', fontSize: 12 },

  inputLabel: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#cccccc', marginTop: 12, marginBottom: 5 },
  input:      { backgroundColor: '#3a3a3a', borderWidth: 1, borderColor: '#555', borderRadius: 6, height: 46, paddingHorizontal: 12, color: '#ffffff', fontSize: 14 },
  halfRow:    { flexDirection: 'row', gap: 12 },
  halfField:  { flex: 1 },
  typeRow:    { flexDirection: 'row', gap: 10 },
  typeBtn:    { flex: 1, height: 44, borderRadius: 6, borderWidth: 1.5, borderColor: '#555', alignItems: 'center', justifyContent: 'center' },
  typeBtnActive:    { backgroundColor: '#ffde59', borderColor: '#ffde59' },
  typeBtnText:      { fontFamily: 'Montserrat_700Bold', fontSize: 13, color: '#888', fontWeight: '700' },
  typeBtnTextActive:{ color: '#010101' },
  toggleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  toggleLabel:{ fontFamily: 'Montserrat_400Regular', fontSize: 14, color: '#ffffff' },

  modalBtnRow:      { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn:        { flex: 1, backgroundColor: '#3a3a3a', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelText:       { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700', fontSize: 14 },
  saveBtn:          { flex: 1, backgroundColor: '#ffffff', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  saveBtnText:      { fontFamily: 'Montserrat_700Bold', color: '#010101', fontWeight: '700', fontSize: 14, letterSpacing: 1 },
  deleteConfirmBtn: { flex: 1, backgroundColor: '#ff3131', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  deleteConfirmText:{ fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700', fontSize: 14 },
  broadcastBtn:     { flex: 1, backgroundColor: '#ff3131', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  broadcastBtnText: { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700', fontSize: 14, letterSpacing: 1 },

  broadcastSuccess:     { backgroundColor: 'rgba(56,182,255,0.15)', borderRadius: 8, padding: 16, alignItems: 'center', marginVertical: 12 },
  broadcastSuccessText: { fontFamily: 'Montserrat_700Bold', fontSize: 15, color: '#38b6ff', fontWeight: '700' },
});

export default AdminDiscountsScreen;