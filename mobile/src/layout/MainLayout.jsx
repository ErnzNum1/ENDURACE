import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Dimensions } from 'react-native';

import DrawerContent          from '../components/DrawerContent';
import { useAuth }            from '../context/auth';

import LandingPageScreen      from '../screens/LandingPageScreen';
import CartScreen             from '../screens/CartScreen';
import WishlistScreen         from '../screens/WishlistScreen';
import OrdersScreen           from '../screens/OrdersScreen';
import ProfileScreen          from '../screens/ProfileScreen';
import ProductInfoScreen      from '../screens/ProductInfoScreen';
import OrderInfoScreen        from '../screens/OrderInfoScreen';
import AdminProductsScreen    from '../screens/AdminProductsScreen';
import AddEditProductScreen   from '../screens/AddEditProductScreen';
import MyReviewsScreen        from '../screens/MyReviewsScreen';
import AdminOrdersScreen      from '../screens/AdminOrdersScreen';
import AdminDiscountsScreen   from '../screens/AdminDiscountsScreen';
import PromotionScreen        from '../screens/PromotionScreen';
import ArticleScreen         from '../screens/ArticleScreen';
import ArticleInfoScreen      from '../screens/ArticleInfoScreen';
import AdminArticleScreen    from '../screens/AdminArticleScreen';
import AddEditArticleScreen from '../screens/AddEditArticleScreen';
import AdminDashboardScreen   from '../screens/AdminDashboardScreen';
import AdminUserScreen from '../screens/AdminUserScreen';
import AdminUsersScreen from '../screens/AdminUserScreen';

const Drawer = createDrawerNavigator();
const Stack  = createNativeStackNavigator();
const { width } = Dimensions.get('window');

const hidden = { drawerItemStyle: { display: 'none' } };

const DrawerNavigator = () => {
  const { user } = useAuth();
  const isAdmin  = user?.role === 'admin';

  return (
    <Drawer.Navigator
      initialRouteName={isAdmin ? 'AdminDashboard' : 'Landing'}
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown:    false,
        drawerType:     'slide',
        drawerStyle:    { width: width * 0.75, backgroundColor: '#121212' },
        overlayColor:   'rgba(0,0,0,0.55)',
        swipeEdgeWidth: 40,
      }}
    >
      {/* ── User screens ── */}
      <Drawer.Screen name="Landing"      component={LandingPageScreen} />
      <Drawer.Screen name="Cart"         component={CartScreen} />
      <Drawer.Screen name="Wishlist"     component={WishlistScreen} />
      <Drawer.Screen name="Orders"       component={OrdersScreen} />
      <Drawer.Screen name="MyReviews"    component={MyReviewsScreen} />
      <Drawer.Screen name="Articles"     component={ArticleScreen} />
      <Drawer.Screen name="Profile"      component={ProfileScreen} />

      {/* ── Admin screens ── */}
      <Drawer.Screen name="AdminDashboard"    component={AdminDashboardScreen}   />
      <Drawer.Screen name="AdminProducts"     component={AdminProductsScreen}    options={hidden} />
      <Drawer.Screen name="AdminOrders"       component={AdminOrdersScreen}      options={hidden} />
      <Drawer.Screen name="AdminDiscounts"    component={AdminDiscountsScreen}   options={hidden} />
      <Drawer.Screen name="AdminArticles"     component={AdminArticleScreen}    options={hidden} />
      <Drawer.Screen name="AddEditArticle"    component={AddEditArticleScreen} options={hidden} />
      <Drawer.Screen name="AddEditProduct"    component={AddEditProductScreen}   options={hidden} />
      <Drawer.Screen name="AdminUsers"        component={AdminUsersScreen}   options={hidden} />

      {/* ── Detail screens ── */}
      <Drawer.Screen name="ProductInfo"  component={ProductInfoScreen}  options={hidden} />
      <Drawer.Screen name="OrderInfo"    component={OrderInfoScreen}    options={hidden} />
      <Drawer.Screen name="ArticleInfo"  component={ArticleInfoScreen}  options={hidden} />
      <Drawer.Screen name="Promotion"    component={PromotionScreen}    options={hidden} />
    </Drawer.Navigator>
  );
};

const MainLayout = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
    <Stack.Screen name="Drawer" component={DrawerNavigator} />
  </Stack.Navigator>
);

export default MainLayout;