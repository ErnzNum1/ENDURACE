import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const PageHeader = ({ title }) => {
  return (
    <View style={styles.headerContainer}>
      {/* Left stripe */}
      <View style={styles.leftStripe}>
        <View style={[styles.stripe, styles.redStripe]} />
        <View style={[styles.stripe, styles.yellowStripe]} />
        <View style={[styles.stripe, styles.blueStripe]} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Right stripe */}
      <View style={styles.rightStripe}>
        <View style={[styles.stripe, styles.redStripe]} />
        <View style={[styles.stripe, styles.yellowStripe]} />
        <View style={[styles.stripe, styles.blueStripe]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingTop: 30,
    paddingBottom: 10,
    backgroundColor: 'transparent',
  },
  leftStripe: {
    flex: 1,
    overflow: 'hidden',
  },
  rightStripe: {
    flex: 1,
    overflow: 'hidden',
  },
  stripe: {
    height: 8,
    width: '100%',
  },
  redStripe: {
    backgroundColor: '#ff3131',
  },
  yellowStripe: {
    backgroundColor: '#ffde59',
  },
  blueStripe: {
    backgroundColor: '#38b6ff',
  },
  title: {
    fontFamily: 'Oswald_700Bold',
    fontSize: 32,
    fontStyle: 'italic',
    color: '#ffffff',
    textAlign: 'center',
    paddingHorizontal: 16,
    letterSpacing: 2,
  },
});

export default PageHeader;