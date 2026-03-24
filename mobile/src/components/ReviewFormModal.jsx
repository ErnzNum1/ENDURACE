import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCamera, faPhotoFilm, faXmark } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from '../context/auth';
import StarRatingInput from './StarRatingInput';
import Constants from 'expo-constants';

const BASE_URL = Platform.OS === 'web'
  ? ''
  : Constants.expoConfig?.extra?.apiUrl || 'http://192.168.100.5:5000';

const ReviewFormModal = ({ visible, onClose, productId, orderId, existingReview = null }) => {
  const { accessToken } = useAuth();

  const isEdit = !!existingReview;
  const [rating,     setRating]     = useState(existingReview?.rating  || 0);
  const [comment,    setComment]    = useState(existingReview?.comment || '');
  const [images,     setImages]     = useState([]);   // local assets
  const [loading,    setLoading]    = useState(false);
  const [localError, setLocalError] = useState('');

  useEffect(() => {
    setRating(existingReview?.rating  || 0);
    setComment(existingReview?.comment || '');
    setImages([]);
    setLocalError('');
  }, [existingReview, visible]);

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission denied');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setImages((prev) => [...prev, ...result.assets].slice(0, 3));
    }
  };

  const removeImage = (i) => setImages((prev) => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    setLocalError('');
    if (!rating)              return setLocalError('Please select a star rating.');
    if (!comment.trim())      return setLocalError('Please write a comment.');
    if (comment.trim().length < 10) return setLocalError('Comment must be at least 10 characters.');

    setLoading(true);
    try {
      if (isEdit) {
        // Update review
        const formData = new FormData();
        formData.append('rating',  rating);
        formData.append('comment', comment.trim());
        images.forEach((asset) => {
          const uri  = Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri;
          const type = asset.mimeType || 'image/jpeg';
          const ext  = type.includes('png') ? 'png' : 'jpg';
          formData.append('images', { uri, type, name: `review_${Date.now()}.${ext}` });
        });
        const res = await fetch(`${BASE_URL}/api/reviews/${existingReview._id}`, {
          method:  'PUT',
          headers: { Authorization: `Bearer ${accessToken}` },
          body:    formData,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
      } else {
        // Create review — orderId comes from props (passed by OrdersScreen)
        // or from the canReview check (passed by ProductInfoScreen)
        if (!orderId) throw new Error('No eligible order found for this product.');
        const formData = new FormData();
        formData.append('productId', productId);
        formData.append('orderId',   orderId);
        formData.append('rating',    rating);
        formData.append('comment',   comment.trim());
        images.forEach((asset) => {
          const uri  = Platform.OS === 'ios' ? asset.uri.replace('file://', '') : asset.uri;
          const type = asset.mimeType || 'image/jpeg';
          const ext  = type.includes('png') ? 'png' : 'jpg';
          formData.append('images', { uri, type, name: `review_${Date.now()}.${ext}` });
        });
        const res = await fetch(`${BASE_URL}/api/reviews`, {
          method:  'POST',
          headers: { Authorization: `Bearer ${accessToken}` },
          body:    formData,
        });
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
      }
      onClose();
    } catch (e) {
      setLocalError(e.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheet}>
          <Text style={styles.title}>{isEdit ? 'EDIT REVIEW' : 'WRITE A REVIEW'}</Text>

          {!!localError && (
            <View style={styles.errorBox}><Text style={styles.errorText}>{localError}</Text></View>
          )}

          <Text style={styles.label}>Your Rating</Text>
          <View style={styles.starRow}>
            <StarRatingInput rating={rating} onChange={setRating} size={32} />
          </View>

          <Text style={styles.label}>Your Review</Text>
          <TextInput
            style={styles.textArea}
            value={comment}
            onChangeText={setComment}
            placeholder="Share your experience with this product..."
            placeholderTextColor="#777"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.charCount}>{comment.length}/1000</Text>

          {/* Image picker */}
          <View style={styles.imagesRow}>
            {images.map((img, i) => (
              <View key={i} style={styles.imageThumb}>
                <Image source={{ uri: img.uri }} style={styles.imageThumbImg} />
                <TouchableOpacity style={styles.removeImg} onPress={() => removeImage(i)}>
                  <FontAwesomeIcon icon={faXmark} size={10} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ))}
            {images.length < 3 && (
              <TouchableOpacity style={styles.addImageBtn} onPress={pickImages} activeOpacity={0.8}>
                <FontAwesomeIcon icon={faPhotoFilm} size={18} color="rgba(255,255,255,0.6)" />
                <Text style={styles.addImageText}>Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>CANCEL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
              {loading
                ? <ActivityIndicator color="#010101" />
                : <Text style={styles.submitText}>{isEdit ? 'SAVE' : 'SUBMIT'}</Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  sheet:       { backgroundColor: '#1e1e1e', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  title:       { fontFamily: 'Oswald_700Bold', fontSize: 20, fontStyle: 'italic', color: '#ffffff', letterSpacing: 1, marginBottom: 16, textAlign: 'center' },
  errorBox:    { backgroundColor: 'rgba(255,49,49,0.15)', borderWidth: 1, borderColor: '#ff3131', borderRadius: 6, padding: 10, marginBottom: 12 },
  errorText:   { fontFamily: 'Montserrat_400Regular', color: '#ff3131', fontSize: 12 },
  label:       { fontFamily: 'Montserrat_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 8, marginTop: 12 },
  starRow:     { alignItems: 'flex-start', marginBottom: 4 },
  textArea:    { backgroundColor: '#2a2a2a', borderWidth: 1, borderColor: '#444', borderRadius: 8, padding: 12, color: '#ffffff', fontSize: 14, fontFamily: 'Montserrat_400Regular', minHeight: 110, lineHeight: 20 },
  charCount:   { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'right', marginTop: 4, marginBottom: 4 },
  imagesRow:   { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 4 },
  imageThumb:  { width: 60, height: 60, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  imageThumbImg:{ width: 60, height: 60 },
  removeImg:   { position: 'absolute', top: 2, right: 2, backgroundColor: 'rgba(0,0,0,0.6)', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  addImageBtn: { width: 60, height: 60, borderRadius: 8, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.3)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 4 },
  addImageText:{ fontFamily: 'Montserrat_400Regular', fontSize: 9, color: 'rgba(255,255,255,0.5)' },
  btnRow:      { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelBtn:   { flex: 1, backgroundColor: '#3a3a3a', borderRadius: 8, height: 50, alignItems: 'center', justifyContent: 'center' },
  cancelText:  { fontFamily: 'Montserrat_700Bold', color: '#ffffff', fontSize: 14, fontWeight: '700' },
  submitBtn:   { flex: 1, backgroundColor: '#ffffff', borderRadius: 8, height: 50, alignItems: 'center', justifyContent: 'center' },
  submitText:  { fontFamily: 'Montserrat_700Bold', color: '#010101', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
});

export default ReviewFormModal;