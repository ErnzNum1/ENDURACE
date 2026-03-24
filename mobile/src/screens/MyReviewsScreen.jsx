import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ImageBackground, Dimensions, SafeAreaView, Modal, ActivityIndicator,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faPenToSquare, faTrash, faStar } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loadMyReviews, removeReview } from '../store/reviewSlice';
import { useAuth } from '../context/auth';
import PageHeader from '../components/PageHeader';
import ReviewFormModal from '../components/ReviewFormModal';

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const CAT_COLORS      = { RUNNING: '#ff3131', SWIMMING: '#38b6ff', CYCLING: '#ffde59' };
const CAT_TEXT_COLORS = { RUNNING: '#ffffff', SWIMMING: '#ffffff', CYCLING: '#010101' };

const MyReviewsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const { myReviews, loading } = useSelector((s) => s.reviews);

  const [editTarget,       setEditTarget]       = useState(null);
  const [deleteTarget,     setDeleteTarget]     = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);

  useEffect(() => { dispatch(loadMyReviews(accessToken)); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(removeReview({
      reviewId:  deleteTarget._id,
      productId: deleteTarget.product?._id || deleteTarget.product,
      accessToken,
    }));
    setDeleteTarget(null);
  };

  const renderItem = ({ item }) => {
    const category  = item.product?.category || '';
    const badgeBg   = CAT_COLORS[category]      || '#3a3a3a';
    const badgeText = CAT_TEXT_COLORS[category] || '#ffffff';

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.product?.images?.[0] || 'https://via.placeholder.com/80' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardBody}>
          {!!category && (
            <View style={[styles.badge, { backgroundColor: badgeBg }]}>
              <Text style={[styles.badgeText, { color: badgeText }]}>{category}</Text>
            </View>
          )}
          <Text style={styles.productName} numberOfLines={1}>{item.product?.name || 'Product'}</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <FontAwesomeIcon key={s} icon={faStar} size={13}
                color={s <= item.rating ? '#ffde59' : 'rgba(255,222,89,0.25)'} />
            ))}
            <Text style={styles.ratingNum}>{item.rating}/5</Text>
          </View>
          <Text style={styles.commentText} numberOfLines={2}>{item.comment}</Text>
          <Text style={styles.dateText}>
            {new Date(item.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.editBtn} onPress={() => { setEditTarget(item); setEditModalVisible(true); }}>
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
    <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faChevronLeft} size={18} color="#ffffff" />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.centered}><ActivityIndicator size="large" color="#ffffff" /></View>
        ) : (
          <FlatList
            data={myReviews}
            keyExtractor={(i) => i._id}
            ListHeaderComponent={<PageHeader title="MY REVIEWS" />}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>You haven't written any reviews yet.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      <ReviewFormModal
        visible={editModalVisible}
        onClose={() => { setEditModalVisible(false); setEditTarget(null); }}
        productId={editTarget?.product?._id || editTarget?.product}
        existingReview={editTarget}
      />

      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>DELETE REVIEW</Text>
            <Text style={styles.modalMessage}>
              Remove your review for{' '}
              <Text style={styles.modalHighlight}>{deleteTarget?.product?.name || 'this product'}</Text>?
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteTarget(null)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleDelete}>
                <Text style={styles.confirmText}>DELETE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:       { flex: 1, width, height },
  overlay:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  safe:     { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText:{ fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center' },
  backBtn: {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', width: 38, height: 38,
    borderRadius: 19, alignItems: 'center', justifyContent: 'center',
  },
  listContent: { paddingBottom: 40, paddingTop: 60 },
  card: {
    flexDirection: 'row', alignItems: 'stretch',
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginHorizontal: 12, marginVertical: 6, borderRadius: 10, overflow: 'hidden',
  },
  cardImage:   { width: 90, resizeMode: 'cover' },
  cardBody:    { flex: 1, padding: 10 },
  badge:       { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  badgeText:   { fontFamily: 'Montserrat_700Bold', fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  productName: { fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700', color: '#010101', marginBottom: 4 },
  starsRow:    { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 5 },
  ratingNum:   { fontFamily: 'Montserrat_700Bold', fontSize: 11, color: '#3a3a3a', marginLeft: 4 },
  commentText: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#3a3a3a', lineHeight: 18, marginBottom: 4 },
  dateText:    { fontFamily: 'Montserrat_400Regular', fontSize: 10, color: '#888' },
  cardActions: { flexDirection: 'column', gap: 8, padding: 10, justifyContent: 'center' },
  editBtn:     { backgroundColor: '#ffde59', width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deleteBtn:   { backgroundColor: '#ff3131', width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  modalOverlay:{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalBox:    { backgroundColor: '#2a2a2a', borderRadius: 12, padding: 24, width: '100%' },
  modalTitle:  { fontFamily: 'Oswald_700Bold', fontSize: 22, fontStyle: 'italic', color: '#ffffff', textAlign: 'center', letterSpacing: 1, marginBottom: 12 },
  modalMessage:{ fontFamily: 'Montserrat_400Regular', fontSize: 14, color: '#cccccc', lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  modalHighlight:{ fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700' },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn:   { flex: 1, backgroundColor: '#3a3a3a', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelText:  { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700', fontSize: 14 },
  confirmBtn:  { flex: 1, backgroundColor: '#ff3131', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  confirmText: { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700', fontSize: 14 },
});

export default MyReviewsScreen;