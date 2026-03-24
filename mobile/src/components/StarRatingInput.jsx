import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarEmpty } from '@fortawesome/free-regular-svg-icons';

/**
 * StarRatingInput
 *
 * Dual-mode star component:
 *   - Interactive (default): tapping a star calls onChange(value)
 *   - Read-only: pass readonly={true} for a display-only row
 *
 * Props
 *   rating   {number}   Current value 1–5 (0 = nothing selected yet)
 *   onChange {function} Called with the tapped star value (1–5)
 *   size     {number}   Icon size in px (default 28)
 *   readonly {boolean}  Disable tap interactions (default false)
 *   color    {string}   Filled star colour (default '#ffde59')
 */
const StarRatingInput = ({
  rating   = 0,
  onChange,
  size     = 28,
  readonly = false,
  color    = '#ffde59',
}) => {
  const handlePress = (value) => {
    if (!readonly && onChange) onChange(value);
  };

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= rating;
        return (
          <TouchableOpacity
            key={star}
            onPress={() => handlePress(star)}
            activeOpacity={readonly ? 1 : 0.65}
            style={styles.starTouch}
            disabled={readonly}
          >
            <FontAwesomeIcon
              icon={filled ? faStar : faStarEmpty}
              size={size}
              color={filled ? color : 'rgba(255,222,89,0.3)'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center' },
  starTouch: { paddingHorizontal: 3 },
});

export default StarRatingInput;