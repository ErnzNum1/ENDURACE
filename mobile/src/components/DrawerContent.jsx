import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faHouse, faCartShopping, faHeart, faBagShopping,
  faUser, faStar, faRightFromBracket, faBoxOpen,
  faClipboardList, faTag, faNewspaper, faTachometerAlt, faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/auth';

// ── Nav items for regular users ───────────────────────────────────
const USER_ITEMS = [
  { label: 'Home',       screen: 'Landing',    icon: faHouse },
  { label: 'Cart',       screen: 'Cart',       icon: faCartShopping },
  { label: 'Wishlist',   screen: 'Wishlist',   icon: faHeart },
  { label: 'My Orders',  screen: 'Orders',     icon: faBagShopping },
  { label: 'My Reviews', screen: 'MyReviews',  icon: faStar },
  { label: 'Articles',   screen: 'Articles',   icon: faNewspaper },
  { label: 'Profile',    screen: 'Profile',    icon: faUser },
];

// ── Admin panel items ─────────────────────────────────────────────
const ADMIN_ITEMS = [
  { label: 'Dashboard',       screen: 'AdminDashboard', icon: faTachometerAlt },
  { label: 'Manage Products', screen: 'AdminProducts',  icon: faBoxOpen },
  { label: 'Manage Orders',   screen: 'AdminOrders',    icon: faClipboardList },
  { label: 'Discounts',       screen: 'AdminDiscounts', icon: faTag },
  { label: 'Articles',        screen: 'AdminArticles',  icon: faNewspaper },
  { label: 'Users',          screen: 'AdminUsers',     icon: faUsers },
];

const DrawerContent = (props) => {
  const { navigation, state } = props;
  const { user, logout } = useAuth();

  const activeRouteName = state.routes[state.index]?.name;
  const isAdmin = user?.role === 'admin';

  const avatarUri =
    user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      `${user?.firstName || ''} ${user?.lastName || ''}`
    )}&background=38b6ff&color=fff&size=200`;

  const handleLogout = async () => {
    await logout();
    navigation.reset({ index: 0, routes: [{ name: 'FrontPage' }] });
  };

  const NavItem = ({ item, accentColor = '#ffffff', iconActive = '#010101' }) => {
    const isActive = activeRouteName === item.screen;
    return (
      <TouchableOpacity
        style={[styles.navItem, isActive && styles.navItemActive]}
        onPress={() => navigation.navigate(item.screen)}
        activeOpacity={0.75}
      >
        <View style={[
          styles.iconWrap,
          isActive && { backgroundColor: accentColor },
          !isActive && accentColor !== '#ffffff' && { backgroundColor: `${accentColor}22` },
        ]}>
          <FontAwesomeIcon
            icon={item.icon}
            size={17}
            color={isActive ? iconActive : (accentColor !== '#ffffff' ? accentColor : 'rgba(255,255,255,0.7)')}
          />
        </View>
        <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
          {item.label}
        </Text>
        {isActive && <View style={styles.activeBar} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.stripeRow}>
          <View style={[styles.stripe, { backgroundColor: '#ff3131' }]} />
          <View style={[styles.stripe, { backgroundColor: '#ffde59' }]} />
          <View style={[styles.stripe, { backgroundColor: '#38b6ff' }]} />
        </View>
        <Text style={styles.logo}>
          ENDUR<Text style={styles.logoA}>A</Text>
          <Text style={styles.logoC}>C</Text>
          <Text style={styles.logoE}>E</Text>
        </Text>
        <TouchableOpacity
          style={styles.userRow}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
        >
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.firstName} {user?.lastName}
            </Text>
            <Text style={styles.userEmail} numberOfLines={1}>{user?.email}</Text>
            {isAdmin && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* ── Scroll area ── */}
      <DrawerContentScrollView
        {...props}
        scrollEnabled
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Regular user nav — always shown */}
        <Text style={styles.sectionLabel}>MENU</Text>
        {USER_ITEMS.map((item) => (
          <NavItem key={item.screen} item={item} />
        ))}

        {/* Admin panel — only shown when role = admin */}
        {isAdmin && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>ADMIN PANEL</Text>
            {ADMIN_ITEMS.map((item) => (
              <NavItem key={item.screen} item={item} accentColor="#ffde59" iconActive="#010101" />
            ))}
          </>
        )}
      </DrawerContentScrollView>

      {/* ── Footer ── */}
      <View style={styles.footer}>
        <View style={styles.divider} />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faRightFromBracket} size={18} color="#ff3131" />
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>EndurACE © 2026</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#121212' },
  header:  { paddingBottom: 16, backgroundColor: '#1a1a1a' },
  stripeRow: { height: 5, flexDirection: 'row' },
  stripe:  { flex: 1 },
  logo: {
    fontFamily: 'Oswald_700Bold', fontSize: 28, fontStyle: 'italic',
    color: '#ffffff', letterSpacing: 1, paddingHorizontal: 20, paddingTop: 18, marginBottom: 16,
  },
  logoA: { color: '#ff3131' },
  logoC: { color: '#ffde59' },
  logoE: { color: '#38b6ff' },
  userRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 12 },
  avatar:  { width: 52, height: 52, borderRadius: 26, borderWidth: 2, borderColor: '#38b6ff' },
  userInfo:{ flex: 1 },
  userName:{ fontFamily: 'Montserrat_700Bold', fontSize: 15, fontWeight: '700', color: '#ffffff', marginBottom: 2 },
  userEmail:{ fontFamily: 'Montserrat_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  adminBadge: { alignSelf: 'flex-start', backgroundColor: '#ffde59', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  adminBadgeText: { fontFamily: 'Montserrat_700Bold', fontSize: 9, fontWeight: '700', color: '#010101', letterSpacing: 0.5 },
  scrollContent: { paddingTop: 12, paddingBottom: 8 },
  sectionLabel: {
    fontFamily: 'Montserrat_700Bold', fontSize: 10, fontWeight: '700',
    color: 'rgba(255,255,255,0.35)', letterSpacing: 1.5,
    paddingHorizontal: 20, marginTop: 8, marginBottom: 6,
  },
  navItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    marginHorizontal: 8, borderRadius: 10, gap: 14,
    position: 'relative', marginBottom: 2,
  },
  navItemActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  iconWrap: {
    width: 36, height: 36, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  navLabel:       { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.7)', flex: 1 },
  navLabelActive: { color: '#ffffff' },
  activeBar: {
    width: 4, height: 24, backgroundColor: '#38b6ff', borderRadius: 2,
    position: 'absolute', right: 0,
  },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginHorizontal: 16, marginVertical: 12 },
  footer:     { paddingHorizontal: 16, paddingBottom: 30, backgroundColor: '#121212' },
  logoutBtn:  { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 4, paddingVertical: 12 },
  logoutText: { fontFamily: 'Montserrat_700Bold', fontSize: 14, fontWeight: '700', color: '#ff3131', letterSpacing: 0.5 },
  footerNote: { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 4 },
});

export default DrawerContent;