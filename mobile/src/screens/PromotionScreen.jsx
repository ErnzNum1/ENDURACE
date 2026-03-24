import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ImageBackground,
  Dimensions, SafeAreaView, TouchableOpacity,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faTag, faChevronLeft, faShoppingBag } from '@fortawesome/free-solid-svg-icons';

const { width, height } = Dimensions.get('window');
const BG_IMAGE = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

/**
 * PromotionScreen
 * Rendered when a user taps a promo push notification.
 * route.params receives: { title, body, discountCode } from the notification data payload.
 */
const PromotionScreen = ({ navigation, route }) => {
  const { title, body, discountCode } = route.params || {};

  return (
    <ImageBackground source={{ uri: BG_IMAGE }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safeArea}>
        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faChevronLeft} size={18} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.content}>
          {/* Promo icon */}
          <View style={styles.iconCircle}>
            <FontAwesomeIcon icon={faTag} size={40} color="#ffde59" />
          </View>

          {/* Stripes */}
          <View style={styles.stripeRow}>
            <View style={[styles.stripe, { backgroundColor: '#ff3131' }]} />
            <View style={[styles.stripe, { backgroundColor: '#ffde59' }]} />
            <View style={[styles.stripe, { backgroundColor: '#38b6ff' }]} />
          </View>

          {/* Title */}
          <Text style={styles.promoTitle}>{title || 'Special Offer!'}</Text>

          {/* Body message */}
          <Text style={styles.promoBody}>{body || 'Check out our latest deals.'}</Text>

          {/* Discount code block */}
          {!!discountCode && (
            <View style={styles.codeBlock}>
              <Text style={styles.codeBlockLabel}>USE CODE AT CHECKOUT</Text>
              <View style={styles.codeRow}>
                <FontAwesomeIcon icon={faTag} size={16} color="#ffde59" />
                <Text style={styles.codeValue}>{discountCode}</Text>
              </View>
              <Text style={styles.codeHint}>Enter this code in the cart before placing your order.</Text>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate('Landing')}
            activeOpacity={0.85}
          >
            <FontAwesomeIcon icon={faShoppingBag} size={18} color="#010101" />
            <Text style={styles.shopBtnText}>SHOP NOW</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:      { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.55)' },
  safeArea:{ flex: 1 },
  backBtn: {
    position: 'absolute', top: 56, left: 16, zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)', width: 38, height: 38,
    borderRadius: 19, alignItems: 'center', justifyContent: 'center',
  },
  content: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30,
  },
  iconCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'rgba(255,222,89,0.15)',
    borderWidth: 2, borderColor: 'rgba(255,222,89,0.4)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 24,
  },
  stripeRow: {
    width: 80, height: 6, flexDirection: 'row',
    borderRadius: 3, overflow: 'hidden', marginBottom: 24,
  },
  stripe: { flex: 1 },
  promoTitle: {
    fontFamily: 'Oswald_700Bold', fontSize: 32, fontStyle: 'italic',
    color: '#ffffff', letterSpacing: 1, textAlign: 'center', marginBottom: 14,
  },
  promoBody: {
    fontFamily: 'Montserrat_400Regular', fontSize: 16, color: 'rgba(255,255,255,0.8)',
    lineHeight: 26, textAlign: 'center', marginBottom: 32,
  },
  codeBlock: {
    width: '100%', backgroundColor: 'rgba(255,222,89,0.1)',
    borderWidth: 1.5, borderColor: 'rgba(255,222,89,0.5)',
    borderRadius: 12, padding: 20, alignItems: 'center', marginBottom: 32,
  },
  codeBlockLabel: {
    fontFamily: 'Montserrat_700Bold', fontSize: 10, fontWeight: '700',
    color: 'rgba(255,222,89,0.7)', letterSpacing: 2, marginBottom: 12,
  },
  codeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10,
  },
  codeValue: {
    fontFamily: 'Oswald_700Bold', fontSize: 36, fontStyle: 'italic',
    color: '#ffde59', letterSpacing: 3,
  },
  codeHint: {
    fontFamily: 'Montserrat_400Regular', fontSize: 12,
    color: 'rgba(255,255,255,0.55)', textAlign: 'center', lineHeight: 18,
  },
  shopBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#ffffff', paddingHorizontal: 36, paddingVertical: 16,
    borderRadius: 8, width: '100%', justifyContent: 'center',
  },
  shopBtnText: {
    fontFamily: 'Montserrat_700Bold', fontSize: 15, fontWeight: '700',
    color: '#010101', letterSpacing: 1,
  },
});

export default PromotionScreen;