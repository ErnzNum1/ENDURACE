import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faBagShopping,
  faHeart,
  faHouse,
  faCartShopping,
  faUser,
  faBars,
} from '@fortawesome/free-solid-svg-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';

const { width } = Dimensions.get('window');

/**
 * FooterNavigation
 *
 * Props:
 *   navigation   – react-navigation prop (or use hook internally)
 *   activeScreen – current screen name to highlight the correct icon
 */
const FooterNavigation = ({ navigation: navProp, activeScreen }) => {
  // Prefer the passed prop; fall back to the hook so screens that forget to
  // pass it still work.
  const hookNav   = useNavigation();
  const navigation = navProp || hookNav;

  const navItems = [
    { icon: faBagShopping,  screen: 'Orders',   label: 'Orders'   },
    { icon: faHeart,        screen: 'Wishlist',  label: 'Wishlist' },
    { icon: faHouse,        screen: 'Landing',   label: 'Home'     },
    { icon: faCartShopping, screen: 'Cart',      label: 'Cart'     },
    { icon: faUser,         screen: 'Profile',   label: 'Profile'  },
  ];

  const handleNavigate = (screen) => {
    navigation.navigate(screen);
  };

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <View style={styles.container}>
      {/* Hamburger — opens drawer */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={openDrawer}
        activeOpacity={0.7}
      >
        <View style={styles.iconWrapper}>
          <FontAwesomeIcon icon={faBars} size={22} color="#ffffff" />
        </View>
      </TouchableOpacity>

      {/* Main nav items */}
      {navItems.map((item, index) => {
        const isActive = activeScreen === item.screen;
        return (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => handleNavigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrapper, isActive && styles.activeWrapper]}>
              <FontAwesomeIcon
                icon={item.icon}
                size={20}
                color={isActive ? '#010101' : '#ffffff'}
              />
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    height: 70,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
    margin: 10,
    borderWidth: 1,
    borderColor: '#ffffff',
    borderRadius: 16,
    elevation: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  activeWrapper: {
    backgroundColor: '#ffffff',
    width: 46,
    height: 46,
    borderRadius: 23,
    elevation: 6,
  },
});

export default FooterNavigation;