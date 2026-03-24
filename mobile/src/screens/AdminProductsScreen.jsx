import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  SafeAreaView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faPlus, faPenToSquare, faTrash, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loadProducts, removeProduct } from '../store/productSlice';
import PageHeader from '../components/PageHeader';
import FooterNavigation from '../components/FooterNavigation';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const CATEGORY_COLORS = {
  RUNNING: '#ff3131',
  SWIMMING: '#38b6ff',
  CYCLING: '#ffde59',
};
const CATEGORY_TEXT_COLORS = {
  RUNNING: '#ffffff',
  SWIMMING: '#ffffff',
  CYCLING: '#010101',
};

const AdminProductsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { items: products, loading } = useSelector((state) => state.products);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    dispatch(loadProducts());
  }, []);

  const handleDelete = () => {
    if (!deleteTarget) return;
    dispatch(removeProduct(deleteTarget._id));
    setDeleteTarget(null);
  };

  const renderItem = ({ item }) => {
    const badgeBg = CATEGORY_COLORS[item.category] || '#3a3a3a';
    const badgeText = CATEGORY_TEXT_COLORS[item.category] || '#ffffff';

    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.images?.[0] || 'https://via.placeholder.com/80' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardBody}>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeText }]}>{item.category}</Text>
          </View>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardVariation} numberOfLines={1}>{item.variation}</Text>
          <Text style={styles.cardPrice}>Php. {item.price?.toLocaleString()}</Text>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.editBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('AddEditProduct', { product: item })}
          >
            <FontAwesomeIcon icon={faPenToSquare} size={15} color="#010101" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            activeOpacity={0.8}
            onPress={() => setDeleteTarget(item)}
          >
            <FontAwesomeIcon icon={faTrash} size={15} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground source={{ uri: BG_IMAGE }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.8}
        >
          <FontAwesomeIcon icon={faChevronLeft} size={18} color="#ffffff" />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item._id}
            ListHeaderComponent={<PageHeader title="PRODUCTS" />}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No products yet.</Text>
              </View>
            }
          />
        )}

        {/* FAB */}
        <TouchableOpacity
          style={styles.fab}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('AddEditProduct', { product: null })}
        >
          <FontAwesomeIcon icon={faPlus} size={22} color="#010101" />
        </TouchableOpacity>
      </SafeAreaView>

      {/* Delete Confirm Modal */}
      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteTarget(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>DELETE PRODUCT</Text>
            <Text style={styles.modalMessage}>
              Remove{' '}
              <Text style={styles.modalHighlight}>{deleteTarget?.name}</Text>
              {' '}permanently? This cannot be undone.
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setDeleteTarget(null)}
              >
                <Text style={styles.cancelBtnText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmDeleteBtn} onPress={handleDelete}>
                <Text style={styles.confirmDeleteText}>DELETE</Text>
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
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: { paddingBottom: 120, paddingTop: 60 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText: {
    fontFamily: 'Montserrat_400Regular',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cardImage: { width: 90, height: 100, resizeMode: 'cover' },
  cardBody: { flex: 1, padding: 10 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 4,
  },
  badgeText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardName: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#010101',
    marginBottom: 1,
  },
  cardVariation: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 11,
    color: '#555',
    marginBottom: 3,
  },
  cardPrice: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#010101',
  },
  cardActions: {
    flexDirection: 'column',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#ffde59',
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    backgroundColor: '#ff3131',
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalBox: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 22,
    fontStyle: 'italic',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: 1,
    marginBottom: 12,
  },
  modalMessage: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalHighlight: {
    fontFamily: 'Montserrat_700Bold',
    color: '#ffffff',
    fontWeight: '700',
  },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#3a3a3a',
    borderRadius: 6,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontFamily: 'Montserrat_700Bold',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: '#ff3131',
    borderRadius: 6,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmDeleteText: {
    fontFamily: 'Montserrat_700Bold',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default AdminProductsScreen;