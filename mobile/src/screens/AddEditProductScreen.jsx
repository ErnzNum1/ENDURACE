import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft,
  faCamera,
  faImage,
  faXmark,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { addProduct, editProduct } from '../store/productSlice';
import AuthHeader from '../components/AuthHeader';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const CATEGORIES = ['RUNNING', 'SWIMMING', 'CYCLING'];

const CATEGORY_COLORS = {
  RUNNING: '#ff3131',
  SWIMMING: '#38b6ff',
  CYCLING: '#ffde59',
};

const AddEditProductScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.products);
  const editingProduct = route.params?.product || null;
  const isEdit = !!editingProduct;

  // Form state
  const [name, setName] = useState(editingProduct?.name || '');
  const [description, setDescription] = useState(editingProduct?.description || '');
  const [price, setPrice] = useState(editingProduct?.price?.toString() || '');
  const [category, setCategory] = useState(editingProduct?.category || 'RUNNING');
  const [variation, setVariation] = useState(editingProduct?.variation || '');
  const [stock, setStock] = useState(editingProduct?.stock?.toString() || '0');

  // Images: existing URLs (from server) + new local URIs
  const [existingImages, setExistingImages] = useState(editingProduct?.images || []);
  const [newImages, setNewImages] = useState([]); // { uri, type, name }

  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [imagePickerModal, setImagePickerModal] = useState(false);
  const [error, setError] = useState('');

  // ── Image Picker ──────────────────────────────────────────────
  const requestPermissions = async () => {
    const camera = await ImagePicker.requestCameraPermissionsAsync();
    const library = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return { camera: camera.status === 'granted', library: library.status === 'granted' };
  };

  const pickFromCamera = async () => {
    setImagePickerModal(false);
    const perms = await requestPermissions();
    if (!perms.camera) {
      setError('Camera permission is required.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setNewImages((prev) => [
        ...prev,
        { uri: asset.uri, type: 'image/jpeg', name: `photo_${Date.now()}.jpg` },
      ]);
    }
  };

  const pickFromGallery = async () => {
    setImagePickerModal(false);
    const perms = await requestPermissions();
    if (!perms.library) {
      setError('Gallery permission is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsMultipleSelection: true,
      selectionLimit: 5 - existingImages.length - newImages.length,
    });
    if (!result.canceled && result.assets?.length > 0) {
      const picked = result.assets.map((a) => ({
        uri: a.uri,
        type: a.mimeType || 'image/jpeg',
        name: `photo_${Date.now()}.jpg`,
      }));
      setNewImages((prev) => [...prev, ...picked]);
    }
  };

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) return setError('Product name is required.');
    if (!description.trim()) return setError('Description is required.');
    if (!price || isNaN(Number(price))) return setError('Valid price is required.');
    if (existingImages.length + newImages.length === 0) {
      return setError('At least one image is required.');
    }

    const formData = new FormData();
    formData.append('name', name.trim());
    formData.append('description', description.trim());
    formData.append('price', price);
    formData.append('category', category);
    formData.append('variation', variation.trim());
    formData.append('stock', stock);

    // Append new image files
    newImages.forEach((img, i) => {
      formData.append('images', {
        uri: img.uri,
        type: img.type,
        name: img.name,
      });
    });

    // For edit: tell backend which existing images to keep (removed ones get deleted)
    if (isEdit) {
      // We pass existing images still present; backend handles removal of missing ones
      // via the removeImages field computed on the server — for simplicity we send
      // all currently retained existing image URLs
      existingImages.forEach((url) => formData.append('keepImages', url));
    }

    try {
      if (isEdit) {
        await dispatch(editProduct({ id: editingProduct._id, formData })).unwrap();
      } else {
        await dispatch(addProduct(formData)).unwrap();
      }
      navigation.goBack();
    } catch (e) {
      setError(e || 'Something went wrong. Please try again.');
    }
  };

  const totalImages = existingImages.length + newImages.length;

  return (
    <ImageBackground source={{ uri: BG_IMAGE }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.headerArea}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                <FontAwesomeIcon icon={faChevronLeft} size={18} color="#ffffff" />
              </TouchableOpacity>
              <AuthHeader title={isEdit ? 'EDIT PRODUCT' : 'ADD PRODUCT'} />
            </View>

            <View style={styles.form}>
              {/* Error */}
              {!!error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {/* Images */}
              <Text style={styles.label}>Product Images ({totalImages}/5)</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.imageRow}
                contentContainerStyle={styles.imageRowContent}
              >
                {/* Existing images */}
                {existingImages.map((uri, i) => (
                  <View key={`existing-${i}`} style={styles.imageThumbnail}>
                    <Image source={{ uri }} style={styles.thumbImg} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => setExistingImages((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <FontAwesomeIcon icon={faXmark} size={10} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {/* New images */}
                {newImages.map((img, i) => (
                  <View key={`new-${i}`} style={styles.imageThumbnail}>
                    <Image source={{ uri: img.uri }} style={styles.thumbImg} />
                    <TouchableOpacity
                      style={styles.removeImageBtn}
                      onPress={() => setNewImages((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <FontAwesomeIcon icon={faXmark} size={10} color="#ffffff" />
                    </TouchableOpacity>
                  </View>
                ))}
                {/* Add image button */}
                {totalImages < 5 && (
                  <TouchableOpacity
                    style={styles.addImageBtn}
                    onPress={() => setImagePickerModal(true)}
                    activeOpacity={0.8}
                  >
                    <FontAwesomeIcon icon={faCamera} size={22} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.addImageText}>Add</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              {/* Name */}
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholderTextColor="#888"
                placeholder="e.g. ADIZERO EVO SL"
              />

              {/* Description */}
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholderTextColor="#888"
                placeholder="Describe the product..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Price + Stock row */}
              <View style={styles.halfRow}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Price (Php)</Text>
                  <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                    placeholder="0"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Stock</Text>
                  <TextInput
                    style={styles.input}
                    value={stock}
                    onChangeText={setStock}
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                    placeholder="0"
                  />
                </View>
              </View>

              {/* Category */}
              <Text style={styles.label}>Category</Text>
              <TouchableOpacity
                style={styles.dropdownBtn}
                onPress={() => setCategoryDropdown(!categoryDropdown)}
                activeOpacity={0.8}
              >
                <View style={[styles.catDot, { backgroundColor: CATEGORY_COLORS[category] }]} />
                <Text style={styles.dropdownBtnText}>{category}</Text>
                <FontAwesomeIcon icon={faChevronDown} size={14} color="#aaa" />
              </TouchableOpacity>
              {categoryDropdown && (
                <View style={styles.dropdownMenu}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={styles.dropdownItem}
                      onPress={() => { setCategory(cat); setCategoryDropdown(false); }}
                    >
                      <View style={[styles.catDot, { backgroundColor: CATEGORY_COLORS[cat] }]} />
                      <Text style={styles.dropdownItemText}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Variation */}
              <Text style={styles.label}>Variation</Text>
              <TextInput
                style={styles.input}
                value={variation}
                onChangeText={setVariation}
                placeholderTextColor="#888"
                placeholder="e.g. Black & White"
              />

              {/* Submit */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#010101" />
                ) : (
                  <Text style={styles.submitText}>
                    {isEdit ? 'SAVE CHANGES' : 'ADD PRODUCT'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Image Source Modal */}
      <Modal
        visible={imagePickerModal}
        transparent
        animationType="slide"
        onRequestClose={() => setImagePickerModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setImagePickerModal(false)}
        >
          <View style={styles.imagePickerSheet}>
            <Text style={styles.sheetTitle}>ADD PHOTO</Text>
            <TouchableOpacity style={styles.sheetOption} onPress={pickFromCamera}>
              <FontAwesomeIcon icon={faCamera} size={20} color="#ffffff" />
              <Text style={styles.sheetOptionText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={pickFromGallery}>
              <FontAwesomeIcon icon={faImage} size={20} color="#ffffff" />
              <Text style={styles.sheetOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sheetCancel}
              onPress={() => setImagePickerModal(false)}
            >
              <Text style={styles.sheetCancelText}>CANCEL</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  safeArea: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  headerArea: { marginTop: 20, marginBottom: 10 },
  backBtn: {
    position: 'absolute',
    top: 14,
    left: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { paddingHorizontal: 24 },

  errorBox: {
    backgroundColor: 'rgba(255,49,49,0.2)',
    borderWidth: 1,
    borderColor: '#ff3131',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    fontFamily: 'Montserrat_400Regular',
    color: '#ff3131',
    fontSize: 13,
  },

  label: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 13,
    color: '#ffffff',
    marginBottom: 7,
    marginTop: 14,
  },
  input: {
    backgroundColor: '#3a3a3a',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 6,
    height: 52,
    paddingHorizontal: 14,
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  halfRow: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  // Images
  imageRow: { marginBottom: 4 },
  imageRowContent: { gap: 10, paddingVertical: 4 },
  imageThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageBtn: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addImageText: {
    fontFamily: 'Montserrat_400Regular',
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
  },

  // Category dropdown
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#3a3a3a',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 6,
    height: 52,
    paddingHorizontal: 14,
  },
  catDot: { width: 12, height: 12, borderRadius: 6 },
  dropdownBtnText: {
    flex: 1,
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: '#ffffff',
  },
  dropdownMenu: {
    backgroundColor: '#2a2a2a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#555',
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownItemText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: '#ffffff',
  },

  // Submit
  submitBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 28,
  },
  submitText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#010101',
    letterSpacing: 1,
  },

  // Image picker bottom sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  imagePickerSheet: {
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  sheetTitle: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 18,
    fontStyle: 'italic',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 20,
    textAlign: 'center',
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  sheetOptionText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 15,
    color: '#ffffff',
    fontWeight: '700',
  },
  sheetCancel: {
    marginTop: 16,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 6,
  },
  sheetCancelText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
});

export default AddEditProductScreen;