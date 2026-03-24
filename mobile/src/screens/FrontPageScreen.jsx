import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  FlatList,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SLIDE_IMAGES = [
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174860/cade7624-faf6-482c-b09c-148ee9520063.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174858/8fa956f5-bbb2-4ebc-9e0f-40a1cc870652.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174841/22698711-978e-4d9a-88f7-87ff711abb09.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174827/f45dce54-b95f-46ee-ab66-1a9217d124c9.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174813/f4977c60-c6a1-4f41-ad14-7bdb434e3a76.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174793/fcd48718-1c40-484c-8c50-63a1c6640930.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174767/5e11096b-5264-415f-a435-1716b1ad7c77.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772174964/17fe13c6-79e0-4956-9515-97b734209512.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772175087/492674d5-4936-4d14-b631-01e4c328a0f3.png',
  'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772175156/c75fec02-207c-4d20-aac7-6724cad49cd2.png',
];

const FrontPageScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % SLIDE_IMAGES.length;
        flatListRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const renderSlide = ({ item }) => (
    <Image source={{ uri: item }} style={styles.slideImage} />
  );

  return (
    <View style={styles.container}>
      {/* Slideshow Background */}
      <FlatList
        ref={flatListRef}
        data={SLIDE_IMAGES}
        renderItem={renderSlide}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        style={StyleSheet.absoluteFill}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Dark overlay */}
      <View style={styles.overlay} />

      {/* Bottom content */}
      <View style={styles.bottomContent}>
        {/* Diagonal stripe separator */}
        <View style={styles.stripeContainer}>
          <View style={[styles.diagonalStripe, styles.red]} />
          <View style={[styles.diagonalStripe, styles.yellow]} />
          <View style={[styles.diagonalStripe, styles.blue]} />
        </View>

        {/* Brand */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandText}>
            ENDUR<Text style={styles.logoA}>A</Text><Text style={styles.logoC}>C</Text><Text style={styles.logoE}>E</Text>
          </Text>
        </View>

        {/* Tagline */}
        <Text style={styles.tagline}>
          bili na kayo mamahaling jersey, bib{'\n'}shorts, swimsuits, etc.
        </Text>

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            activeOpacity={0.85}
          >
            <Text style={styles.loginText}>LOGIN</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={() => navigation.navigate('Auth', { screen: 'Register' })}
            activeOpacity={0.85}
          >
            <Text style={styles.registerText}>REGISTER</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#010101',
    overflow: 'hidden',
    maxHeight: height,
  },
  slideImage: {
    width,
    height,
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#2a2a2a',
    paddingBottom: 50,
    paddingHorizontal: 30,
  },
  stripeContainer: {
    position: 'absolute',
    top: -30,
    left: -20,
    right: -20,
    height: 60,
    transform: [{ skewY: '4deg' }],
  },
  diagonalStripe: {
    flex: 1,
  },
  red: { backgroundColor: '#ff3131' },
  yellow: { backgroundColor: '#ffde59' },
  blue: { backgroundColor: '#38b6ff' },
  brandContainer: {
    marginTop: 50,
    marginBottom: 12,
  },
  brandText: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 42,
    fontStyle: 'italic',
    color: '#ffffff',
    letterSpacing: 1,
  },
  logoA: {
    color: '#ff3131',
  },
  logoC: {
    color: '#ffde59',
  },
  logoE: {
    color: '#38B6ff',
  },
  tagline: {
    fontFamily:'Montserrat_400Regular',
    fontSize: 14,
    color: '#cccccc',
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 16,
  },
  loginBtn: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    borderRadius: 6,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#010101',
    letterSpacing: 1,
  },
  registerBtn: {
    flex: 1,
    backgroundColor: '#010101',
    paddingVertical: 18,
    borderRadius: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  registerText: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
});

export default FrontPageScreen;