import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ImageBackground, Dimensions, SafeAreaView, Modal, ActivityIndicator,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faPlus, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loadAdminArticles, removeArticle } from '../store/articleSlice';
import { useAuth } from '../context/auth';
import PageHeader from '../components/PageHeader';

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const AdminArticlesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const { adminList, loading } = useSelector((s) => s.articles);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { dispatch(loadAdminArticles(accessToken)); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(removeArticle({ id: deleteTarget._id, accessToken }));
    setDeleteTarget(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        {!!item.subtitle && <Text style={styles.cardSub} numberOfLines={1}>{item.subtitle}</Text>}
        <View style={styles.cardMeta}>
          <Text style={styles.metaText}>{item.readTime}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={[styles.metaText, { color: item.isActive ? '#38b6ff' : '#ff3131' }]}>
            {item.isActive ? 'Active' : 'Inactive'}
          </Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>
            {item.content?.sections?.length || 0} sections
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.editBtn}
          onPress={() => navigation.navigate('AddEditArticle', { article: item })}
        >
          <FontAwesomeIcon icon={faPenToSquare} size={14} color="#010101" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => setDeleteTarget(item)}>
          <FontAwesomeIcon icon={faTrash} size={14} color="#ffffff" />
        </TouchableOpacity>
      </View>
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
          data={adminList}
          keyExtractor={(i) => i._id}
          ListHeaderComponent={<PageHeader title="ARTICLES" />}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={() => dispatch(loadAdminArticles(accessToken))}
          refreshing={loading}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No articles yet. Tap + to create one.</Text>
              </View>
            ) : null
          }
        />

        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('AddEditArticle', { article: null })}
          activeOpacity={0.85}
        >
          <FontAwesomeIcon icon={faPlus} size={22} color="#010101" />
        </TouchableOpacity>
      </SafeAreaView>

      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <View style={styles.centeredOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>DELETE ARTICLE</Text>
            <Text style={styles.modalMessage}>
              Delete{' '}
              <Text style={{ color: '#ffffff', fontFamily: 'Montserrat_700Bold' }}>{deleteTarget?.title}</Text>
              ? This cannot be undone.
            </Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setDeleteTarget(null)}>
                <Text style={styles.cancelText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: '#ff3131' }]}
                onPress={handleDelete}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#ffffff" />
                  : <Text style={[styles.saveBtnText, { color: '#ffffff' }]}>DELETE</Text>
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
  listContent:  { paddingBottom: 120, paddingTop: 60 },
  centered:     { alignItems: 'center', paddingTop: 40 },
  emptyText:    { fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', fontSize: 14, textAlign: 'center' },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    marginHorizontal: 12, marginVertical: 6, borderRadius: 10, padding: 14,
  },
  cardBody:    { flex: 1 },
  cardTitle:   { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#010101', marginBottom: 4 },
  cardSub:     { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#555', marginBottom: 6 },
  cardMeta:    { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaText:    { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: '#777' },
  metaDot:     { color: '#aaa' },
  cardActions: { flexDirection: 'column', gap: 8, marginLeft: 8 },
  editBtn:     { backgroundColor: '#ffde59', width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  deleteBtn:   { backgroundColor: '#ff3131', width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  fab: {
    position: 'absolute', bottom: 30, right: 20, width: 56, height: 56,
    borderRadius: 28, backgroundColor: '#ffffff', alignItems: 'center', justifyContent: 'center', elevation: 8,
  },
  centeredOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  modalBox:    { backgroundColor: '#2a2a2a', borderRadius: 12, padding: 24, width: '100%' },
  modalTitle:  { fontFamily: 'Oswald_700Bold', fontSize: 20, fontStyle: 'italic', color: '#ffffff', textAlign: 'center', letterSpacing: 1, marginBottom: 12 },
  modalMessage:{ fontFamily: 'Montserrat_400Regular', fontSize: 14, color: '#cccccc', lineHeight: 22, textAlign: 'center', marginBottom: 20 },
  modalBtnRow: { flexDirection: 'row', gap: 12 },
  cancelBtn:   { flex: 1, backgroundColor: '#3a3a3a', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  cancelText:  { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontWeight: '700', fontSize: 14 },
  saveBtn:     { flex: 1, backgroundColor: '#ffffff', borderRadius: 6, height: 48, alignItems: 'center', justifyContent: 'center' },
  saveBtnText: { fontFamily: 'Montserrat_700Bold', color: '#010101', fontWeight: '700', fontSize: 14 },
});

export default AdminArticlesScreen;