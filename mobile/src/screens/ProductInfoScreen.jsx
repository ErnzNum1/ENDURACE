import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ImageBackground,
  Dimensions, SafeAreaView, FlatList, Image, ScrollView,
  ActivityIndicator, Alert,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faCartShopping, faBolt, faChevronLeft,
  faStar, faStarHalfStroke,
} from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';
import { addToCart } from '../store/cartSlice';
import { loadProductReviews } from '../store/reviewSlice';

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const CAT_COLORS      = { RUNNING: '#ff3131', SWIMMING: '#38b6ff', CYCLING: '#ffde59' };
const CAT_TEXT_COLORS = { RUNNING: '#ffffff', SWIMMING: '#ffffff', CYCLING: '#010101' };

// ── Memoized selectors to prevent rerender warnings ───────────────
const makeSelectReviews = () =>
  createSelector(
    (state) => state.reviews.byProduct,
    (_, productId) => productId,
    (byProduct, productId) => byProduct?.[productId] ?? []
  );

const StarDisplay = ({ rating, size = 13 }) => (
  <View style={{ flexDirection: 'row', gap: 2 }}>
    {[1, 2, 3, 4, 5].map((s) => (
      <FontAwesomeIcon
        key={s}
        icon={
          s <= Math.floor(rating) ? faStar
          : s === Math.ceil(rating) && rating % 1 !== 0 ? faStarHalfStroke
          : faStarEmpty
        }
        size={size}
        color="#ffde59"
      />
    ))}
  </View>
);

const ProductInfoScreen = ({ navigation, route }) => {
  const { product } = route.params;
  const dispatch    = useDispatch();

  // Create stable memoized selector instance
  const selectReviews = useCallback(makeSelectReviews(), []);
  const reviews        = useSelector((state) => selectReviews(state, product._id));
  const reviewsLoading = useSelector((s) => s.reviews.loading);

  const flatListRef  = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const categoryBg   = CAT_COLORS[product.category]      || '#3a3a3a';
  const categoryText = CAT_TEXT_COLORS[product.category] || '#ffffff';

  useEffect(() => {
    dispatch(loadProductReviews(product._id));
  }, [product._id]);

  const handleScroll = (e) => {
    setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
  };

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: product._id, productId: product._id,
      name: product.name, variation: product.variation || '',
      price: product.price, quantity: 1, image: product.images?.[0] || '',
    }));
    Alert.alert('Added', `${product.name} added to cart.`);
  };

  const handleBuyNow = () => {
    dispatch(addToCart({
      id: product._id, productId: product._id,
      name: product.name, variation: product.variation || '',
      price: product.price, quantity: 1, image: product.images?.[0] || '',
    }));
    navigation.navigate('Cart');
  };

  const avgRating = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : (product.averageRating || 0).toFixed(1);

  const renderImage = ({ item }) => (
    <Image source={{ uri: item }} style={styles.productImage} resizeMode="cover" />
  );

  return (
    <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faChevronLeft} size={18} color="#ffffff" />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Image slideshow */}
          <View style={styles.imageContainer}>
            {product.images?.length > 0 ? (
              <>
                <FlatList
                  ref={flatListRef}
                  data={product.images}
                  renderItem={renderImage}
                  keyExtractor={(_, i) => String(i)}
                  horizontal pagingEnabled showsHorizontalScrollIndicator={false}
                  onScroll={handleScroll} scrollEventThrottle={16}
                  getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
                />
                <View style={styles.dotsContainer}>
                  {product.images.map((_, i) => (
                    <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
                  ))}
                </View>
              </>
            ) : (
              <View style={[styles.productImage, { backgroundColor: '#2a2a2a', alignItems: 'center', justifyContent: 'center' }]}>
                <Text style={{ color: '#666' }}>No image</Text>
              </View>
            )}
          </View>

          {/* Details */}
          <View style={styles.section}>
            <View style={styles.topRow}>
              <View style={[styles.categoryBadge, { backgroundColor: categoryBg }]}>
                <Text style={[styles.categoryBadgeText, { color: categoryText }]}>{product.category}</Text>
              </View>
              <Text style={styles.price}>Php. {product.price?.toLocaleString()}</Text>
            </View>
            <Text style={styles.productName}>{product.name}</Text>
            {!!product.variation && <Text style={styles.variation}>Variation: {product.variation}</Text>}
          </View>

          <View style={styles.divider} />

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Product Description</Text>
            <Text style={styles.description}>{product.description || 'No description available.'}</Text>
          </View>

          <View style={styles.divider} />

          {/* Reviews — display only, no write button here */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Customer Reviews</Text>

            <View style={styles.ratingSummaryRow}>
              <Text style={styles.ratingBig}>{avgRating}</Text>
              <View style={styles.ratingSummaryRight}>
                <StarDisplay rating={Number(avgRating)} size={16} />
                <Text style={styles.reviewCount}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</Text>
              </View>
            </View>

            <Text style={styles.reviewHint}>
              Purchased this product? Go to My Orders to leave a review.
            </Text>

            {reviewsLoading ? (
              <ActivityIndicator color="#ffffff" style={{ marginTop: 20 }} />
            ) : reviews.length === 0 ? (
              <Text style={styles.noReviews}>No reviews yet.</Text>
            ) : (
              reviews.map((review) => {
                const reviewer = review.user || {};
                const name     = reviewer.firstName
                  ? `${reviewer.firstName} ${reviewer.lastName || ''}`.trim()
                  : 'Anonymous';
                const avatar   = reviewer.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=38b6ff&color=fff&size=80`;
                return (
                  <View key={review._id} style={styles.reviewCard}>
                    <View style={styles.reviewHeader}>
                      <Image source={{ uri: avatar }} style={styles.reviewAvatar} />
                      <View style={styles.reviewMeta}>
                        <Text style={styles.reviewerName}>{name}</Text>
                        <StarDisplay rating={review.rating} />
                        <Text style={styles.reviewDate}>
                          {new Date(review.createdAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.reviewText}>{review.comment}</Text>
                    {/* Review images */}
                    {review.images?.length > 0 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                        {review.images.map((img, i) => (
                          <Image key={i} source={{ uri: img }} style={styles.reviewImage} resizeMode="cover" />
                        ))}
                      </ScrollView>
                    )}
                  </View>
                );
              })
            )}
          </View>

          <View style={{ height: 110 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Action bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.addToCartBtn} activeOpacity={0.85} onPress={handleAddToCart}>
          <FontAwesomeIcon icon={faCartShopping} size={18} color="#010101" />
          <Text style={styles.addToCartText}>ADD TO CART</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buyNowBtn} activeOpacity={0.85} onPress={handleBuyNow}>
          <FontAwesomeIcon icon={faBolt} size={18} color="#ffffff" />
          <Text style={styles.buyNowText}>BUY NOW</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:      { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  safe:    { flex: 1 },
  backBtn: {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', width: 38, height: 38,
    borderRadius: 19, alignItems: 'center', justifyContent: 'center',
  },
  scrollContent:   { paddingBottom: 20 },
  imageContainer:  { width, height: height * 0.42, backgroundColor: '#010101' },
  productImage:    { width, height: height * 0.42 },
  dotsContainer:   { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot:             { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
  dotActive:       { backgroundColor: '#ffffff', width: 20, borderRadius: 4 },
  section:         { paddingHorizontal: 18, paddingVertical: 16 },
  topRow:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  categoryBadge:   { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  categoryBadgeText:{ fontFamily: 'Montserrat_700Bold', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  price:           { fontFamily: 'Montserrat_700Bold', fontSize: 22, fontWeight: '700', color: '#ffffff' },
  productName:     { fontFamily: 'Oswald_700Bold', fontSize: 28, fontStyle: 'italic', color: '#ffffff', letterSpacing: 1, marginBottom: 6 },
  variation:       { fontFamily: 'Montserrat_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  divider:         { height: 1, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 18 },
  sectionTitle:    { fontFamily: 'Oswald_700Bold', fontSize: 18, fontStyle: 'italic', color: '#ffffff', letterSpacing: 1, marginBottom: 10 },
  description:     { fontFamily: 'Montserrat_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22 },
  ratingSummaryRow:{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 10 },
  ratingBig:       { fontFamily: 'Oswald_700Bold', fontSize: 42, fontStyle: 'italic', color: '#ffffff' },
  ratingSummaryRight:{ gap: 4 },
  reviewCount:     { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  reviewHint:      { fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.45)', marginBottom: 14, fontStyle: 'italic' },
  noReviews:       { fontFamily: 'Montserrat_400Regular', color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  reviewCard:      { backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 10, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  reviewHeader:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 12 },
  reviewAvatar:    { width: 44, height: 44, borderRadius: 22 },
  reviewMeta:      { flex: 1, gap: 3 },
  reviewerName:    { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#ffffff' },
  reviewDate:      { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.5)' },
  reviewText:      { fontFamily: 'Montserrat_400Regular', fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 20 },
  reviewImage:     { width: 80, height: 80, borderRadius: 6, marginRight: 8 },
  actionBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 12,
    backgroundColor: 'rgba(0,0,0,0.85)',
    borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
  },
  addToCartBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#ffffff', borderRadius: 8, height: 48 },
  addToCartText:{ fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700', color: '#010101', letterSpacing: 0.5 },
  buyNowBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#ff3131', borderRadius: 8, height: 48 },
  buyNowText:   { fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700', color: '#ffffff', letterSpacing: 0.5 },
});

export default ProductInfoScreen;