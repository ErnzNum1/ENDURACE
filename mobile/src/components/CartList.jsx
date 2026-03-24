import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

/**
 * CartList — driven entirely by the item prop from Redux.
 * Quantity is NOT stored in local state; every change dispatches
 * immediately so SQLite and Redux stay in sync.
 */
const CartList = ({ item, onQuantityChange, onMinusAtOne, checked, onCheckToggle }) => {
  const quantity = item.quantity ?? 1;

  const handleDecrease = () => {
    if (quantity === 1) {
      if (onMinusAtOne) onMinusAtOne(item);
      return;
    }
    if (onQuantityChange) onQuantityChange(item.id, quantity - 1);
  };

  const handleIncrease = () => {
    if (onQuantityChange) onQuantityChange(item.id, quantity + 1);
  };

  const total = (item.price * quantity).toLocaleString();

  return (
    <View style={styles.container}>
      {/* Checkbox */}
      <TouchableOpacity
        style={styles.checkboxWrapper}
        onPress={() => onCheckToggle && onCheckToggle(item.id)}
        activeOpacity={0.8}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <FontAwesomeIcon icon={faCheck} size={10} color="#ffffff" />}
        </View>
      </TouchableOpacity>

      {/* Product Image */}
      <Image source={{ uri: item.image }} style={styles.image} />

      {/* Product Details */}
      <View style={styles.details}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.variation}>Variation: {item.variation}</Text>
        <Text style={styles.price}>Price: Php. {item.price?.toLocaleString()}</Text>

        {/* Quantity Controls + Total */}
        <View style={styles.bottomRow}>
          <View style={styles.quantityContainer}>
            <TouchableOpacity style={styles.btnMinus} onPress={handleDecrease} activeOpacity={0.8}>
              <Text style={styles.btnText}>−</Text>
            </TouchableOpacity>
            <View style={styles.quantityBadge}>
              <Text style={styles.quantityText}>{quantity}</Text>
            </View>
            <TouchableOpacity style={styles.btnPlus} onPress={handleIncrease} activeOpacity={0.8}>
              <Text style={styles.btnText}>+</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>TOTAL:</Text>
            <Text style={styles.totalValue}>Php. {total}</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  checkboxWrapper: { paddingHorizontal: 10, alignSelf: 'center' },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#3a3a3a',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: '#010101', borderColor: '#010101' },
  image: { width: 100, height: 120, resizeMode: 'cover' },
  details: { flex: 1, padding: 10, justifyContent: 'space-between' },
  productName: {
    fontFamily: 'Montserrat_700Bold',
    fontSize: 14,
    fontWeight: '700',
    color: '#010101',
    marginBottom: 2,
  },
  variation: { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: '#3a3a3a' },
  price: { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: '#3a3a3a', marginBottom: 6 },
  bottomRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center' },
  btnMinus: {
    backgroundColor: '#ff3131',
    width: 26, height: 26, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  btnPlus: {
    backgroundColor: '#38b6ff',
    width: 26, height: 26, borderRadius: 4,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', lineHeight: 20 },
  quantityBadge: {
    backgroundColor: '#ffde59',
    width: 26, height: 26,
    alignItems: 'center', justifyContent: 'center',
  },
  quantityText: { color: '#010101', fontWeight: 'bold', fontSize: 13 },
  totalContainer: { alignItems: 'flex-end' },
  totalLabel: { fontFamily: 'Montserrat_400Regular', fontSize: 10, color: '#3a3a3a' },
  totalValue: { fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700', color: '#010101' },
});

export default CartList;