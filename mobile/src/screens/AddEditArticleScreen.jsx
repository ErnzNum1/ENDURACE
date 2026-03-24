import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ImageBackground, Dimensions,
  SafeAreaView, ScrollView, TouchableOpacity, TextInput,
  ActivityIndicator, Image, Alert, Platform, Modal,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faChevronLeft, faPlus, faTrash, faImage,
  faCamera, faPhotoFilm, faCheck, faXmark,
  faChevronUp, faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import * as ImagePicker from 'expo-image-picker';
import { useDispatch } from 'react-redux';
import { loadArticles } from '../store/articleSlice';
import { useAuth } from '../context/auth';
import {
  fetchArticleById, uploadImageFile,
  createArticleApi, updateArticleApi,
} from '../services/article';

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

// ─────────────────────────────────────────────────────────────────────────────
// Small reusable components
// ─────────────────────────────────────────────────────────────────────────────

const FieldLabel = ({ text, required }) => (
  <Text style={styles.fieldLabel}>
    {text}{required && <Text style={{ color: '#ff3131' }}> *</Text>}
  </Text>
);

const Field = ({ label, value, onChangeText, placeholder, multiline, required, keyboardType }) => (
  <View style={styles.fieldBlock}>
    <FieldLabel text={label} required={required} />
    <TextInput
      style={[styles.input, multiline && styles.inputMulti]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="rgba(255,255,255,0.35)"
      multiline={multiline}
      keyboardType={keyboardType}
      textAlignVertical={multiline ? 'top' : 'center'}
    />
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// Image Picker Button — handles camera / gallery
// ─────────────────────────────────────────────────────────────────────────────
const ImagePickerButton = ({ onPicked, children, style }) => {
  const [showMenu, setShowMenu] = useState(false);

  const pick = async (source) => {
    setShowMenu(false);
    let result;
    const opts = { mediaTypes: ImagePicker.MediaType.Images, quality: 0.85, allowsEditing: true };
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permission denied', 'Camera access is required.');
      result = await ImagePicker.launchCameraAsync(opts);
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') return Alert.alert('Permission denied', 'Gallery access is required.');
      result = await ImagePicker.launchImageLibraryAsync(opts);
    }
    if (!result.canceled && result.assets?.[0]) {
      onPicked(result.assets[0]);
    }
  };

  return (
    <>
      <TouchableOpacity style={style} onPress={() => setShowMenu(true)} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={styles.menuSheet}>
            <Text style={styles.menuTitle}>SELECT IMAGE SOURCE</Text>
            <TouchableOpacity style={styles.menuItem} onPress={() => pick('camera')}>
              <FontAwesomeIcon icon={faCamera} size={18} color="#ffde59" />
              <Text style={styles.menuItemText}>Take a Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => pick('gallery')}>
              <FontAwesomeIcon icon={faPhotoFilm} size={18} color="#38b6ff" />
              <Text style={styles.menuItemText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Section editor
// ─────────────────────────────────────────────────────────────────────────────
const SectionEditor = ({ section, index, total, onChange, onRemove, onMoveUp, onMoveDown }) => {
  const updateField = (key, val) => onChange({ ...section, [key]: val });

  const addImage = () =>
    onChange({ ...section, images: [...(section.images || []), { uri: null, uploaded: false, url: '' }] });

  const removeImage = (i) =>
    onChange({ ...section, images: section.images.filter((_, idx) => idx !== i) });

  const setImageFile = (i, asset) =>
    onChange({
      ...section,
      images: section.images.map((img, idx) =>
        idx === i ? { ...img, uri: asset.uri, type: asset.type || 'image/jpeg', name: asset.fileName || `sec_${Date.now()}.jpg`, uploaded: false } : img
      ),
    });

  const setImageUrl = (i, url) =>
    onChange({
      ...section,
      images: section.images.map((img, idx) => idx === i ? { ...img, url, uri: null, uploaded: true } : img),
    });

  const addListItem = () =>
    onChange({ ...section, listItems: [...(section.listItems || []), ''] });

  const updateListItem = (i, val) =>
    onChange({ ...section, listItems: section.listItems.map((li, idx) => idx === i ? val : li) });

  const removeListItem = (i) =>
    onChange({ ...section, listItems: section.listItems.filter((_, idx) => idx !== i) });

  return (
    <View style={styles.sectionCard}>
      {/* Section header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionNum}>SECTION {index + 1}</Text>
        <View style={styles.sectionHeaderActions}>
          {index > 0 && (
            <TouchableOpacity style={styles.iconBtn} onPress={onMoveUp}>
              <FontAwesomeIcon icon={faChevronUp} size={12} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
          {index < total - 1 && (
            <TouchableOpacity style={styles.iconBtn} onPress={onMoveDown}>
              <FontAwesomeIcon icon={faChevronDown} size={12} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: 'rgba(255,49,49,0.2)' }]} onPress={onRemove}>
            <FontAwesomeIcon icon={faTrash} size={12} color="#ff3131" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Heading */}
      <View style={styles.fieldBlock}>
        <FieldLabel text="Heading" />
        <TextInput
          style={styles.input}
          value={section.heading || ''}
          onChangeText={(v) => updateField('heading', v)}
          placeholder="Section heading..."
          placeholderTextColor="rgba(255,255,255,0.35)"
        />
      </View>

      {/* Body */}
      <View style={styles.fieldBlock}>
        <FieldLabel text="Body Text" />
        <TextInput
          style={[styles.input, styles.inputMulti]}
          value={section.body || ''}
          onChangeText={(v) => updateField('body', v)}
          placeholder="Section body text..."
          placeholderTextColor="rgba(255,255,255,0.35)"
          multiline
          textAlignVertical="top"
        />
      </View>

      {/* Images */}
      <View style={styles.fieldBlock}>
        <View style={styles.rowBetween}>
          <FieldLabel text="Images" />
          <TouchableOpacity style={styles.addSmallBtn} onPress={addImage}>
            <FontAwesomeIcon icon={faPlus} size={11} color="#010101" />
            <Text style={styles.addSmallBtnText}>ADD IMAGE</Text>
          </TouchableOpacity>
        </View>

        {(section.images || []).map((img, i) => (
          <View key={i} style={styles.imageRow}>
            {/* Preview */}
            <View style={styles.imagePreviewBox}>
              {img.uri || img.url ? (
                <Image source={{ uri: img.uri || img.url }} style={styles.imagePreview} />
              ) : (
                <FontAwesomeIcon icon={faImage} size={22} color="rgba(255,255,255,0.25)" />
              )}
            </View>

            <View style={styles.imageInputs}>
              {/* URL input (alternative to file pick) */}
              <TextInput
                style={[styles.input, { marginBottom: 6 }]}
                value={img.url || ''}
                onChangeText={(v) => setImageUrl(i, v)}
                placeholder="Paste image URL..."
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="none"
              />
              <Text style={styles.orText}>— or pick a file —</Text>
              <ImagePickerButton
                style={styles.pickFileBtn}
                onPicked={(asset) => setImageFile(i, asset)}
              >
                <FontAwesomeIcon icon={faPhotoFilm} size={13} color="#ffffff" />
                <Text style={styles.pickFileBtnText}>
                  {img.uri ? '✓ File selected' : 'Choose File'}
                </Text>
              </ImagePickerButton>
            </View>

            <TouchableOpacity style={styles.removeImageBtn} onPress={() => removeImage(i)}>
              <FontAwesomeIcon icon={faXmark} size={14} color="#ff3131" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* List items */}
      <View style={styles.fieldBlock}>
        <View style={styles.rowBetween}>
          <FieldLabel text="List Items" />
          <TouchableOpacity style={styles.addSmallBtn} onPress={addListItem}>
            <FontAwesomeIcon icon={faPlus} size={11} color="#010101" />
            <Text style={styles.addSmallBtnText}>ADD ITEM</Text>
          </TouchableOpacity>
        </View>
        {(section.listItems || []).map((item, i) => (
          <View key={i} style={styles.listItemRow}>
            <Text style={styles.listBullet}>•</Text>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              value={item}
              onChangeText={(v) => updateListItem(i, v)}
              placeholder={`List item ${i + 1}...`}
              placeholderTextColor="rgba(255,255,255,0.35)"
            />
            <TouchableOpacity onPress={() => removeListItem(i)} style={styles.iconBtn}>
              <FontAwesomeIcon icon={faXmark} size={12} color="#ff3131" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main screen
// ─────────────────────────────────────────────────────────────────────────────
const AdminArticleEditScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { accessToken } = useAuth();
  const articleId = route.params?.articleId || null;
  const isEdit    = !!articleId;

  const [loading,    setLoading]    = useState(false);
  const [saving,     setSaving]     = useState(false);
  const [uploadMsg,  setUploadMsg]  = useState('');

  // Form state
  const [title,           setTitle]           = useState('');
  const [subtitle,        setSubtitle]        = useState('');
  const [author,          setAuthor]          = useState('');
  const [readTime,        setReadTime]        = useState('');
  const [featuredImage,   setFeaturedImage]   = useState('');   // final URL
  const [featuredFile,    setFeaturedFile]    = useState(null); // local asset
  const [isActive,        setIsActive]        = useState(true);
  const [sections,        setSections]        = useState([]);

  useEffect(() => {
    if (isEdit) loadArticle();
    else setSections([newSection()]);
  }, [articleId]);

  const newSection = () => ({ heading: '', body: '', images: [], listItems: [] });

  const loadArticle = async () => {
    setLoading(true);
    try {
      const a = await fetchArticleById(articleId);
      setTitle(a.title || '');
      setSubtitle(a.subtitle || '');
      setAuthor(a.author || '');
      setReadTime(String(a.readTime || ''));
      setFeaturedImage(a.featuredImage || '');
      setIsActive(a.isActive !== false);
      // Map existing sections — keep image objects compatible
      setSections((a.content?.sections || []).map((s) => ({
        ...s,
        images: (s.images || []).map((url) =>
          typeof url === 'string'
            ? { url, uri: null, uploaded: true }
            : url
        ),
        listItems: s.listItems || [],
      })));
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Upload all pending files, resolve sections to URL arrays ─────
  const resolveAndSave = async () => {
    if (!title.trim()) return Alert.alert('Validation', 'Title is required.');
    setSaving(true);

    try {
      // 1. Upload featured image file if a new file was picked
      let resolvedFeaturedImage = featuredImage;
      if (featuredFile) {
        setUploadMsg('Uploading featured image...');
        resolvedFeaturedImage = await uploadImageFile(featuredFile, accessToken);
      }

      // 2. Upload any section image files that haven't been uploaded yet
      const resolvedSections = [];
      for (let si = 0; si < sections.length; si++) {
        const sec = sections[si];
        const resolvedImages = [];

        for (let ii = 0; ii < (sec.images || []).length; ii++) {
          const img = sec.images[ii];
          if (img.uri && !img.uploaded) {
            setUploadMsg(`Uploading section ${si + 1} image ${ii + 1}...`);
            const url = await uploadImageFile(
              { uri: img.uri, type: img.type, name: img.name },
              accessToken
            );
            resolvedImages.push(url);
          } else if (img.url) {
            resolvedImages.push(img.url);
          }
          // skip empty slots
        }

        resolvedSections.push({
          heading:   sec.heading   || '',
          body:      sec.body      || '',
          images:    resolvedImages,
          listItems: (sec.listItems || []).filter((li) => li.trim()),
        });
      }

      // 3. Build payload
      const payload = {
        title:        title.trim(),
        subtitle:     subtitle.trim(),
        author:       author.trim(),
        readTime:     Number(readTime) || 5,
        featuredImage: resolvedFeaturedImage,
        isActive,
        content:      { sections: resolvedSections },
      };

      setUploadMsg('Saving article...');
      if (isEdit) {
        await updateArticleApi(articleId, payload, accessToken);
      } else {
        await createArticleApi(payload, accessToken);
      }

      await dispatch(loadArticles());
      Alert.alert('Success', `Article ${isEdit ? 'updated' : 'created'} successfully.`);
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
      setUploadMsg('');
    }
  };

  const addSection  = () => setSections((s) => [...s, newSection()]);
  const removeSection = (i) => {
    if (sections.length === 1) return Alert.alert('', 'At least one section is required.');
    setSections((s) => s.filter((_, idx) => idx !== i));
  };
  const updateSection = (i, updated) =>
    setSections((s) => s.map((sec, idx) => idx === i ? updated : sec));
  const moveSection = (i, dir) => {
    const arr = [...sections];
    const j   = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setSections(arr);
  };

  if (loading) {
    return (
      <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
        <View style={[StyleSheet.absoluteFillObject, { backgroundColor: 'rgba(0,0,0,0.5)' }]} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <FontAwesomeIcon icon={faChevronLeft} size={18} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{isEdit ? 'EDIT ARTICLE' : 'NEW ARTICLE'}</Text>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.6 }]}
            onPress={resolveAndSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            {saving
              ? <ActivityIndicator size="small" color="#010101" />
              : <><FontAwesomeIcon icon={faCheck} size={14} color="#010101" /><Text style={styles.saveBtnText}>SAVE</Text></>
            }
          </TouchableOpacity>
        </View>

        {saving && uploadMsg ? (
          <View style={styles.uploadBanner}>
            <ActivityIndicator size="small" color="#ffde59" />
            <Text style={styles.uploadBannerText}>{uploadMsg}</Text>
          </View>
        ) : null}

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* ── Meta fields ── */}
          <Text style={styles.sectionTitle}>ARTICLE INFO</Text>
          <Field label="Title" value={title} onChangeText={setTitle} placeholder="Article title..." required />
          <Field label="Subtitle" value={subtitle} onChangeText={setSubtitle} placeholder="Short subtitle..." />
          <Field label="Author" value={author} onChangeText={setAuthor} placeholder="Author name..." />
          <Field label="Read Time (minutes)" value={readTime} onChangeText={setReadTime} keyboardType="numeric" placeholder="e.g. 5" />

          {/* ── Active toggle ── */}
          <View style={styles.fieldBlock}>
            <FieldLabel text="Status" />
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, isActive && styles.toggleBtnActive]}
                onPress={() => setIsActive(true)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleBtnText, isActive && styles.toggleBtnTextActive]}>PUBLISHED</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, !isActive && styles.toggleBtnInactive]}
                onPress={() => setIsActive(false)}
                activeOpacity={0.8}
              >
                <Text style={[styles.toggleBtnText, !isActive && styles.toggleBtnTextInactive]}>DRAFT</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Featured Image ── */}
          <Text style={styles.sectionTitle}>FEATURED IMAGE</Text>
          <View style={styles.fieldBlock}>
            <FieldLabel text="Featured Image" />

            {/* Preview */}
            {(featuredFile?.uri || featuredImage) ? (
              <Image
                source={{ uri: featuredFile?.uri || featuredImage }}
                style={styles.featuredPreview}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.featuredPlaceholder}>
                <FontAwesomeIcon icon={faImage} size={32} color="rgba(255,255,255,0.2)" />
                <Text style={styles.featuredPlaceholderText}>No image selected</Text>
              </View>
            )}

            {/* URL input */}
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              value={featuredFile ? '' : featuredImage}
              onChangeText={(v) => { setFeaturedImage(v); setFeaturedFile(null); }}
              placeholder="Paste image URL..."
              placeholderTextColor="rgba(255,255,255,0.35)"
              autoCapitalize="none"
              editable={!featuredFile}
            />
            {featuredFile && (
              <Text style={styles.fileSelectedText}>✓ File selected: {featuredFile.fileName || 'image'}</Text>
            )}
            <Text style={styles.orText}>— or pick a file —</Text>

            {/* File picker */}
            <ImagePickerButton
              style={styles.pickFileBtn}
              onPicked={(asset) => { setFeaturedFile(asset); setFeaturedImage(''); }}
            >
              <FontAwesomeIcon icon={faCamera} size={14} color="#ffffff" />
              <Text style={styles.pickFileBtnText}>
                {featuredFile ? '✓ Change File' : 'Choose Featured Image'}
              </Text>
            </ImagePickerButton>

            {featuredFile && (
              <TouchableOpacity onPress={() => setFeaturedFile(null)} style={styles.clearFileBtn}>
                <Text style={styles.clearFileBtnText}>✕ Remove file (use URL instead)</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Content sections ── */}
          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>CONTENT SECTIONS</Text>
            <TouchableOpacity style={styles.addSectionBtn} onPress={addSection} activeOpacity={0.8}>
              <FontAwesomeIcon icon={faPlus} size={13} color="#010101" />
              <Text style={styles.addSectionBtnText}>ADD SECTION</Text>
            </TouchableOpacity>
          </View>

          {sections.map((sec, i) => (
            <SectionEditor
              key={i}
              index={i}
              total={sections.length}
              section={sec}
              onChange={(updated) => updateSection(i, updated)}
              onRemove={() => removeSection(i)}
              onMoveUp={() => moveSection(i, -1)}
              onMoveDown={() => moveSection(i, 1)}
            />
          ))}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:      { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  safe:    { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
  },
  backBtn:   { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  headerTitle:{ fontFamily: 'Oswald_700Bold', fontSize: 20, fontStyle: 'italic', color: '#ffffff', letterSpacing: 1, flex: 1, textAlign: 'center' },
  saveBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffde59', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 },
  saveBtnText:{ fontFamily: 'Montserrat_700Bold', fontSize: 12, fontWeight: '700', color: '#010101' },

  uploadBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,222,89,0.15)', paddingHorizontal: 16, paddingVertical: 10, marginHorizontal: 16, borderRadius: 8, marginBottom: 8 },
  uploadBannerText: { fontFamily: 'Montserrat_400Regular', color: '#ffde59', fontSize: 13, flex: 1 },

  content: { paddingHorizontal: 16, paddingBottom: 40 },

  sectionTitle: { fontFamily: 'Montserrat_700Bold', fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 2, marginTop: 20, marginBottom: 10 },

  fieldBlock: { marginBottom: 14 },
  fieldLabel: { fontFamily: 'Montserrat_700Bold', fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 6, letterSpacing: 0.5 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    color: '#ffffff', fontFamily: 'Montserrat_400Regular', fontSize: 14, marginBottom: 0,
  },
  inputMulti: { minHeight: 90, paddingTop: 10 },

  toggleRow:             { flexDirection: 'row', gap: 10 },
  toggleBtn:             { flex: 1, height: 40, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  toggleBtnActive:       { backgroundColor: 'rgba(56,182,255,0.25)', borderColor: '#38b6ff' },
  toggleBtnInactive:     { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.15)' },
  toggleBtnText:         { fontFamily: 'Montserrat_700Bold', fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  toggleBtnTextActive:   { color: '#38b6ff' },
  toggleBtnTextInactive: { color: 'rgba(255,255,255,0.4)' },

  featuredPreview:    { width: '100%', height: 180, borderRadius: 10, marginBottom: 4 },
  featuredPlaceholder:{ height: 120, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 },
  featuredPlaceholderText: { fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.3)', fontSize: 12 },

  orText:         { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.35)', textAlign: 'center', marginVertical: 6 },
  pickFileBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)', borderRadius: 8, height: 44 },
  pickFileBtnText:{ fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700', color: '#ffffff' },
  fileSelectedText:{ fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#38b6ff', marginTop: 4 },
  clearFileBtn:   { alignItems: 'center', marginTop: 8 },
  clearFileBtnText:{ fontFamily: 'Montserrat_400Regular', fontSize: 12, color: '#ff3131' },

  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  addSectionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ffde59', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  addSectionBtnText: { fontFamily: 'Montserrat_700Bold', fontSize: 11, fontWeight: '700', color: '#010101' },

  // Section card
  sectionCard:         { backgroundColor: 'rgba(255,255,255,0.07)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 14, marginBottom: 12 },
  sectionHeader:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionNum:          { fontFamily: 'Montserrat_700Bold', fontSize: 11, fontWeight: '700', color: '#ffde59', letterSpacing: 1.5 },
  sectionHeaderActions:{ flexDirection: 'row', gap: 6 },
  iconBtn:             { width: 30, height: 30, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },

  imageRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)', paddingTop: 10 },
  imagePreviewBox: { width: 60, height: 60, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  imagePreview:    { width: 60, height: 60 },
  imageInputs:     { flex: 1 },
  removeImageBtn:  { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', marginTop: 4 },

  addSmallBtn:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#ffde59', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  addSmallBtnText: { fontFamily: 'Montserrat_700Bold', fontSize: 10, fontWeight: '700', color: '#010101' },

  listItemRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  listBullet:   { color: 'rgba(255,255,255,0.5)', fontSize: 18, lineHeight: 22 },

  // Image picker menu modal
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  menuSheet:   { backgroundColor: '#2a2a2a', borderRadius: 14, padding: 24, width: '100%' },
  menuTitle:   { fontFamily: 'Oswald_700Bold', fontSize: 18, fontStyle: 'italic', color: '#ffffff', letterSpacing: 1, textAlign: 'center', marginBottom: 20 },
  menuItem:    { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  menuItemText:{ fontFamily: 'Montserrat_700Bold', fontSize: 15, fontWeight: '700', color: '#ffffff' },
});

export default AdminArticleEditScreen;