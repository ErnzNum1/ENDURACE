import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Dimensions,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTrash, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../components/PageHeader';
import FooterNavigation from '../components/FooterNavigation';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const CATEGORIES = ['ALL', 'SWIMMING', 'RUNNING', 'CYCLING'];

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

const WISHLIST_PRODUCTS = [
  {
    id: '1',
    name: 'ADIZERO EVO SL',
    price: 9459,
    category: 'RUNNING',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174860/cade7624-faf6-482c-b09c-148ee9520063.png',
  },
  {
    id: '2',
    name: 'COLNAGO Y1RS',
    price: 9459,
    category: 'CYCLING',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174858/8fa956f5-bbb2-4ebc-9e0f-40a1cc870652.png',
  },
  {
    id: '3',
    name: 'MET Helmet',
    price: 9459,
    category: 'CYCLING',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174841/22698711-978e-4d9a-88f7-87ff711abb09.png',
  },
  {
    id: '4',
    name: 'TABOLU Cleats Shoes',
    price: 9459,
    category: 'CYCLING',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174827/f45dce54-b95f-46ee-ab66-1a9217d124c9.png',
  },
  {
    id: '5',
    name: 'Temu - Swimsuit',
    price: 9459,
    category: 'SWIMMING',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174813/f4977c60-c6a1-4f41-ad14-7bdb434e3a76.png',
  },
  {
    id: '6',
    name: 'Adidas Running Apparel',
    price: 9459,
    category: 'RUNNING',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174793/fcd48718-1c40-484c-8c50-63a1c6640930.png',
  },
  {
    id: '7',
    name: 'ADIZERO EVO SL V2',
    price: 9459,
    category: 'RUNNING',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174767/5e11096b-5264-415f-a435-1716b1ad7c77.png',
  },
  {
    id: '8',
    name: 'Pro Swim Goggles',
    price: 9459,
    category: 'SWIMMING',
    image: 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174964/17fe13c6-79e0-4956-9515-97b734209512.png',
  },
];

const CARD_WIDTH = (width - 48) / 2;

const WishlistScreen = ({ navigation }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchText, setSearchText] = useState('');

  const filteredProducts = WISHLIST_PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === 'ALL' || product.category === selectedCategory;
    const matchesSearch =
      searchText.trim() === '' ||
      product.name.toLowerCase().includes(searchText.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const renderCard = (item) => {
    const badgeBg = CATEGORY_COLORS[item.category] || '#3a3a3a';
    const badgeText = CATEGORY_TEXT_COLORS[item.category] || '#ffffff';

    return (
      <View key={item.id} style={styles.card}>
        <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
        <View style={styles.cardInfo}>
          <View style={[styles.categoryBadge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.categoryBadgeText, { color: badgeText }]}>
              {item.category}
            </Text>
          </View>
          <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.cardPrice}>Php. {item.price.toLocaleString()}</Text>
        </View>
        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteBtn} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faTrash} size={13} color="#ffffff" />
          <Text style={styles.deleteBtnText}>REMOVE</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderGrid = () => {
    if (filteredProducts.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items in wishlist.</Text>
        </View>
      );
    }

    const rows = [];
    for (let i = 0; i < filteredProducts.length; i += 2) {
      const left = filteredProducts[i];
      const right = filteredProducts[i + 1];
      rows.push(
        <View key={i} style={styles.row}>
          {renderCard(left)}
          {right ? renderCard(right) : <View style={styles.cardSpacer} />}
        </View>
      );
    }
    return rows;
  };

  return (
    <ImageBackground source={{ uri: BG_IMAGE }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <PageHeader title="WISHLIST" />

          {/* Search Bar */}
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                value={searchText}
                onChangeText={setSearchText}
                placeholderTextColor="rgba(255,255,255,0.6)"
                placeholder="Search wishlist..."
              />
              <TouchableOpacity style={styles.searchBtn} activeOpacity={0.8}>
                <FontAwesomeIcon icon={faMagnifyingGlass} size={18} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Category Filter Pills */}
          <View style={styles.pillsRow}>
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              const catColor = CATEGORY_COLORS[cat];
              const activeBg = catColor || '#ffffff';
              const activeText = cat === 'CYCLING' ? '#010101' : '#ffffff';

              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.pill,
                    { borderColor: catColor || '#ffffff' },
                    isActive && { backgroundColor: activeBg, borderColor: activeBg },
                  ]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.pillText,
                      isActive && { color: cat === 'ALL' ? '#010101' : activeText },
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Section Label */}
          <Text style={styles.sectionLabel}>
            {selectedCategory === 'ALL' ? 'All Wishlist' : selectedCategory}
            {'  '}
            <Text style={styles.sectionCount}>({filteredProducts.length})</Text>
          </Text>

          {/* Product Grid */}
          <View style={styles.gridContainer}>
            {renderGrid()}
          </View>
        </ScrollView>
      </SafeAreaView>

      <View style={styles.footer}>
        <FooterNavigation navigation={navigation} activeScreen="Wishlist" />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg: { flex: 1, width, height },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingBottom: 100,
  },
  searchRow: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    borderRadius: 8,
    paddingHorizontal: 14,
    height: 48,
  },
  searchInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Montserrat_400Regular',
    height: '100%',
  },
  searchBtn: { padding: 6 },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    backgroundColor: 'transparent',
  },
  pillText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  sectionLabel: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 18,
    fontStyle: 'italic',
    color: '#ffffff',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  sectionCount: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    fontStyle: 'normal',
    color: 'rgba(255,255,255,0.6)',
  },
  gridContainer: {
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    width: '100%',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
    alignContent: 'space-between'
  },
  cardSpacer: {
    width: CARD_WIDTH,
  },
  cardImage: {
    width: '100%',
    height: CARD_WIDTH,
  },
  cardInfo: {
    padding: 10,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 6,
  },
  categoryBadgeText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardName: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 13,
    fontWeight: '700',
    color: '#010101',
    marginBottom: 4,
  },
  cardPrice: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 12,
    color: '#3a3a3a',
    marginBottom: 8,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#000000',
    paddingVertical: 8,
  },
  deleteBtnText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 11,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontFamily: 'Montserrat_400Regular',
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default WishlistScreen;