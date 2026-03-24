import React, { useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Image,
  StyleSheet, ImageBackground, Dimensions, SafeAreaView, ActivityIndicator,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronRight, faClock } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { loadArticles } from '../store/articleSlice';
import PageHeader from '../components/PageHeader';

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const ArticlesScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { list, loading } = useSelector((s) => s.articles);

  useEffect(() => { dispatch(loadArticles()); }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() => navigation.navigate('ArticleInfo', { articleId: item._id })}
    >
      <Image source={{ uri: item.featuredImage }} style={styles.cardImage} resizeMode="cover" />
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
        {!!item.subtitle && (
          <Text style={styles.cardSubtitle} numberOfLines={2}>{item.subtitle}</Text>
        )}
        <View style={styles.cardMeta}>
          <FontAwesomeIcon icon={faClock} size={11} color="rgba(255,255,255,0.5)" />
          <Text style={styles.metaText}>{item.readTime}</Text>
          <Text style={styles.metaDot}>·</Text>
          <Text style={styles.metaText}>{item.author}</Text>
        </View>
      </View>
      <View style={styles.chevronWrap}>
        <FontAwesomeIcon icon={faChevronRight} size={14} color="rgba(255,255,255,0.4)" />
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        {loading && list.length === 0 ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#ffffff" />
          </View>
        ) : (
          <FlatList
            data={list}
            keyExtractor={(i) => i._id}
            ListHeaderComponent={<PageHeader title="ARTICLES" />}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={() => dispatch(loadArticles())}
            refreshing={loading}
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyText}>No articles yet.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:          { flex: 1, width, height },
  overlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  safe:        { flex: 1 },
  centered:    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyText:   { fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  listContent: { paddingBottom: 40, paddingHorizontal: 12 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12, marginBottom: 12, overflow: 'hidden',
  },
  cardImage:    { width: 100, height: 100, resizeMode: 'cover' },
  cardBody:     { flex: 1, padding: 12 },
  cardTitle:    { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#ffffff', marginBottom: 4, lineHeight: 20 },
  cardSubtitle: { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8, lineHeight: 17 },
  cardMeta:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText:     { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  metaDot:      { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.3)' },
  chevronWrap:  { paddingRight: 14 },
});

export default ArticlesScreen;