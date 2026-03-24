import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ImageBackground, Dimensions, SafeAreaView,
  FlatList, ActivityIndicator,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faClock, faUser } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loadArticleById } from '../store/articleSlice';

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

// ── Image carousel for multiple section images ────────────────────
const ImageCarousel = ({ images }) => {
  const [active, setActive] = useState(0);
  if (!images || images.length === 0) return null;
  if (images.length === 1) {
    return <Image source={{ uri: images[0] }} style={styles.singleImage} resizeMode="cover" />;
  }
  return (
    <View style={styles.carouselWrap}>
      <FlatList
        data={images}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item }) => (
          <Image source={{ uri: item }} style={styles.carouselImage} resizeMode="cover" />
        )}
        onScroll={(e) => setActive(Math.round(e.nativeEvent.contentOffset.x / width))}
        scrollEventThrottle={16}
      />
      <View style={styles.dotsRow}>
        {images.map((_, i) => (
          <View key={i} style={[styles.dot, i === active && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
};

const ArticleInfoScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { articleId } = route.params;
  const { selected: article, loading } = useSelector((s) => s.articles);

  useEffect(() => { dispatch(loadArticleById(articleId)); }, [articleId]);

  if (loading || !article || article._id !== articleId) {
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
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faChevronLeft} size={18} color="#ffffff" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Featured image */}
          {!!article.featuredImage && (
            <Image source={{ uri: article.featuredImage }} style={styles.featuredImage} resizeMode="cover" />
          )}

          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>{article.title}</Text>
            {!!article.subtitle && (
              <Text style={styles.subtitle}>{article.subtitle}</Text>
            )}
            <View style={styles.metaRow}>
              <FontAwesomeIcon icon={faUser} size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{article.author}</Text>
              <View style={styles.metaDivider} />
              <FontAwesomeIcon icon={faClock} size={12} color="rgba(255,255,255,0.5)" />
              <Text style={styles.metaText}>{article.readTime}</Text>
            </View>
          </View>

          {/* Stripes */}
          <View style={styles.stripeRow}>
            <View style={[styles.stripe, { backgroundColor: '#ff3131' }]} />
            <View style={[styles.stripe, { backgroundColor: '#ffde59' }]} />
            <View style={[styles.stripe, { backgroundColor: '#38b6ff' }]} />
          </View>

          {/* Intro */}
          {!!article.content?.intro && (
            <View style={styles.section}>
              <Text style={styles.intro}>{article.content.intro}</Text>
            </View>
          )}

          {/* Sections */}
          {article.content?.sections?.map((sec, idx) => (
            <View key={idx} style={styles.section}>
              {!!sec.heading && (
                <Text style={styles.sectionHeading}>{sec.heading}</Text>
              )}
              {!!sec.body && (
                <Text style={styles.sectionBody}>{sec.body}</Text>
              )}
              {sec.images?.length > 0 && (
                <ImageCarousel images={sec.images} />
              )}
              {sec.listItems?.length > 0 && (
                <View style={styles.listBlock}>
                  {sec.listItems.map((item, li) => (
                    <View key={li} style={styles.listItem}>
                      <View style={styles.bullet} />
                      <Text style={styles.listItemText}>{item}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:       { flex: 1, width, height },
  overlay:  { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  safe:     { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  backBtn:  {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', width: 38, height: 38,
    borderRadius: 19, alignItems: 'center', justifyContent: 'center',
  },
  scroll:        { paddingBottom: 20 },
  featuredImage: { width, height: 240, resizeMode: 'cover' },
  headerSection: { padding: 20, paddingTop: 16 },
  title:         { fontFamily: 'Oswald_700Bold', fontSize: 26, fontStyle: 'italic', color: '#ffffff', letterSpacing: 0.5, marginBottom: 8, lineHeight: 32 },
  subtitle:      { fontFamily: 'Montserrat_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 12, lineHeight: 22 },
  metaRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText:      { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  metaDivider:   { width: 1, height: 12, backgroundColor: 'rgba(255,255,255,0.2)' },
  stripeRow:     { height: 4, flexDirection: 'row', marginBottom: 8 },
  stripe:        { flex: 1 },
  section:       { paddingHorizontal: 20, paddingVertical: 12 },
  intro:         { fontFamily: 'Montserrat_400Regular', fontSize: 15, color: 'rgba(255,255,255,0.85)', lineHeight: 26 },
  sectionHeading:{ fontFamily: 'Oswald_700Bold', fontSize: 20, fontStyle: 'italic', color: '#ffffff', letterSpacing: 0.5, marginBottom: 8 },
  sectionBody:   { fontFamily: 'Montserrat_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 24, marginBottom: 12 },
  singleImage:   { width: '100%', height: 200, borderRadius: 10, marginBottom: 12 },
  carouselWrap:  { marginBottom: 12 },
  carouselImage: { width: width - 40, height: 200, borderRadius: 10, marginRight: 8 },
  dotsRow:       { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 },
  dot:           { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  dotActive:     { backgroundColor: '#ffffff', width: 20, borderRadius: 4 },
  listBlock:     { marginTop: 8, gap: 8 },
  listItem:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet:        { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ffde59', marginTop: 7 },
  listItemText:  { fontFamily: 'Montserrat_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.8)', flex: 1, lineHeight: 22 },
});

export default ArticleInfoScreen;