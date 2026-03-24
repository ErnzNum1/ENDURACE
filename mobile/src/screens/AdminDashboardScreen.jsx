import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ImageBackground, Dimensions, SafeAreaView, ScrollView, ActivityIndicator,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import {
  faBoxOpen, faClipboardList, faTag, faNewspaper,
  faChevronRight, faBars, faUsers, faChartLine,
  faCircleCheck, faClock, faBan, faTruck,
} from '@fortawesome/free-solid-svg-icons';
import { DrawerActions } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { loadDashboardStats } from '../store/userSlice';
import { useAuth } from '../context/auth';

const { width, height } = Dimensions.get('window');
const BG = 'https://res.cloudinary.com/dxnb2ozgw/image/upload/v1772704314/Untitled_design_ydxcpc.png';

const ADMIN_SECTIONS = [
  { label: 'Products',  icon: faBoxOpen,       screen: 'AdminProducts',  color: '#ffde59', textColor: '#010101' },
  { label: 'Orders',    icon: faClipboardList,  screen: 'AdminOrders',    color: '#38b6ff', textColor: '#ffffff' },
  { label: 'Discounts', icon: faTag,            screen: 'AdminDiscounts', color: '#ff3131', textColor: '#ffffff' },
  { label: 'Articles',  icon: faNewspaper,      screen: 'AdminArticles',  color: '#ffffff', textColor: '#010101' },
  { label: 'Users',     icon: faUsers,          screen: 'AdminUsers',     color: '#a855f7', textColor: '#ffffff' },
];

const STATUS_ICONS = {
  PENDING:   { icon: faClock,        color: '#aaaaaa' },
  TO_SHIP:   { icon: faTruck,        color: '#ffde59' },
  DELIVERED: { icon: faCircleCheck,  color: '#38b6ff' },
  CANCELED:  { icon: faBan,          color: '#ff3131' },
};

const AdminDashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, accessToken } = useAuth();
  const { stats, loading } = useSelector((s) => s.users);

  useEffect(() => {
    if (accessToken) dispatch(loadDashboardStats(accessToken));
  }, [accessToken]);

  const StatCard = ({ label, value, color }) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statValue}>{value ?? '—'}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <ImageBackground source={{ uri: BG }} style={styles.bg} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            activeOpacity={0.8}
          >
            <FontAwesomeIcon icon={faBars} size={20} color="#ffffff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.logo}>
              ENDUR<Text style={styles.logoA}>A</Text>
              <Text style={styles.logoC}>C</Text>
              <Text style={styles.logoE}>E</Text>
            </Text>
            <Text style={styles.adminLabel}>ADMIN PANEL</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Welcome */}
          <View style={styles.welcomeBlock}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.welcomeName}>{user?.firstName} {user?.lastName}</Text>
          </View>

          {/* Stripe */}
          <View style={styles.stripeRow}>
            <View style={[styles.stripe, { backgroundColor: '#ff3131' }]} />
            <View style={[styles.stripe, { backgroundColor: '#ffde59' }]} />
            <View style={[styles.stripe, { backgroundColor: '#38b6ff' }]} />
          </View>

          {/* Stats */}
          <Text style={styles.sectionLabel}>OVERVIEW</Text>
          {loading && !stats ? (
            <View style={styles.statsLoading}>
              <ActivityIndicator color="#ffffff" />
            </View>
          ) : (
            <>
              <View style={styles.statsGrid}>
                <StatCard label="Total Users"    value={stats?.totalUsers}    color="#38b6ff" />
                <StatCard label="Total Orders"   value={stats?.totalOrders}   color="#ffde59" />
                <StatCard label="Total Products" value={stats?.totalProducts} color="#ff3131" />
                <StatCard label="Articles"       value={stats?.totalArticles} color="#a855f7" />
              </View>

              {/* Revenue */}
              {stats?.totalRevenue !== undefined && (
                <View style={styles.revenueCard}>
                  <FontAwesomeIcon icon={faChartLine} size={18} color="#ffde59" />
                  <View style={styles.revenueInfo}>
                    <Text style={styles.revenueLabel}>TOTAL REVENUE</Text>
                    <Text style={styles.revenueValue}>
                      Php. {(stats.totalRevenue || 0).toLocaleString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Order status breakdown */}
              {stats?.ordersByStatus && Object.keys(stats.ordersByStatus).length > 0 && (
                <View style={styles.statusRow}>
                  {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                    const meta = STATUS_ICONS[status] || { icon: faClock, color: '#aaa' };
                    return (
                      <View key={status} style={styles.statusChip}>
                        <FontAwesomeIcon icon={meta.icon} size={12} color={meta.color} />
                        <Text style={[styles.statusChipText, { color: meta.color }]}>{count}</Text>
                        <Text style={styles.statusChipLabel}>{status.replace('_', ' ')}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </>
          )}

          {/* Management shortcuts */}
          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>MANAGEMENT</Text>
          {ADMIN_SECTIONS.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={[styles.card, { backgroundColor: item.color }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.85}
            >
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(0,0,0,0.12)' }]}>
                <FontAwesomeIcon icon={item.icon} size={22} color={item.textColor} />
              </View>
              <Text style={[styles.cardLabel, { color: item.textColor }]}>{item.label}</Text>
              <FontAwesomeIcon icon={faChevronRight} size={14} color={item.textColor} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  bg:      { flex: 1, width, height },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  safe:    { flex: 1 },
  header:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, gap: 12 },
  menuBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flex: 1 },
  logo:    { fontFamily: 'Oswald_700Bold', fontSize: 24, fontStyle: 'italic', color: '#ffffff', letterSpacing: 1 },
  logoA:   { color: '#ff3131' },
  logoC:   { color: '#ffde59' },
  logoE:   { color: '#38b6ff' },
  adminLabel: { fontFamily: 'Montserrat_700Bold', fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.5)', letterSpacing: 2 },
  content:    { paddingHorizontal: 16, paddingBottom: 40 },
  welcomeBlock:{ paddingVertical: 16 },
  welcomeText: { fontFamily: 'Montserrat_400Regular', fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  welcomeName: { fontFamily: 'Oswald_700Bold', fontSize: 26, fontStyle: 'italic', color: '#ffffff', letterSpacing: 1 },
  stripeRow:   { height: 4, flexDirection: 'row', borderRadius: 2, overflow: 'hidden', marginBottom: 20 },
  stripe:      { flex: 1 },
  sectionLabel:{ fontFamily: 'Montserrat_700Bold', fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 12 },

  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  statCard:     { flex: 1, minWidth: (width - 52) / 2, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, borderLeftWidth: 3 },
  statValue:    { fontFamily: 'Oswald_700Bold', fontSize: 28, fontStyle: 'italic', color: '#ffffff', marginBottom: 2 },
  statLabel:    { fontFamily: 'Montserrat_400Regular', fontSize: 11, color: 'rgba(255,255,255,0.55)', letterSpacing: 0.5 },
  statsLoading: { height: 80, alignItems: 'center', justifyContent: 'center' },

  revenueCard:  { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: 'rgba(255,222,89,0.1)', borderWidth: 1, borderColor: 'rgba(255,222,89,0.3)', borderRadius: 10, padding: 14, marginBottom: 12 },
  revenueInfo:  { flex: 1 },
  revenueLabel: { fontFamily: 'Montserrat_700Bold', fontSize: 10, fontWeight: '700', color: 'rgba(255,222,89,0.7)', letterSpacing: 1.5 },
  revenueValue: { fontFamily: 'Oswald_700Bold', fontSize: 22, fontStyle: 'italic', color: '#ffde59' },

  statusRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  statusChip:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusChipText: { fontFamily: 'Montserrat_700Bold', fontSize: 13, fontWeight: '700' },
  statusChipLabel:{ fontFamily: 'Montserrat_400Regular', fontSize: 10, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' },

  card:      { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 12, marginBottom: 10 },
  cardIcon:  { width: 44, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  cardLabel: { flex: 1, fontFamily: 'Montserrat_700Bold', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
});

export default AdminDashboardScreen;