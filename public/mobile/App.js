import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { supabase } from './supabaseClient';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { Home, Users, Bell, User as UserIcon, X, CheckCircle2 } from 'lucide-react-native';
import { COLORS } from './src/theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Placeholder screens
const TeamScreen = () => <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}><Text>Team Management</Text></View>;
const AlertsScreen = () => <View style={{ flex: 1, backgroundColor: '#f8fafc', justifyContent: 'center', alignItems: 'center' }}><Text>Alerts & Notifications</Text></View>;

const SECTIONS = [
  { id: 'intro', title: 'Introduction', icon: '📋' },
  { id: 'crop', title: 'Crop Production', icon: '🌾' },
  { id: 'livestock', title: 'Livestock', icon: '🐄' },
  { id: 'fisheries', title: 'Fisheries', icon: '🐟' },
  { id: 'markets', title: 'Markets & Trade', icon: '🏪' },
  { id: 'review', title: 'Review & Submit', icon: '✓' }
];

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Form Navigation</Text>
        <TouchableOpacity onPress={() => props.navigation.closeDrawer()}>
          <X size={20} color={COLORS.textLight} />
        </TouchableOpacity>
      </View>

      <View style={styles.drawerSection}>
        <Text style={styles.drawerLabel}>ASSESSMENT SECTIONS</Text>
        {SECTIONS.map((section, idx) => (
          <TouchableOpacity
            key={section.id}
            style={styles.drawerItem}
            onPress={() => {
              // In a real app, we'd navigate to HomeScreen and set currentSection
              props.navigation.navigate('Home', { sectionIdx: idx });
              props.navigation.closeDrawer();
            }}
          >
            <Text style={styles.drawerIcon}>{section.icon}</Text>
            <Text style={styles.drawerItemText}>{section.title}</Text>
            {/* Show checkmark if completed (mock) */}
            {idx === 0 && <CheckCircle2 size={16} color={COLORS.secondary} style={{ marginLeft: 'auto' }} />}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.drawerSection}>
        <Text style={styles.drawerLabel}>ACCOUNT</Text>
        <TouchableOpacity style={styles.drawerItem} onPress={() => props.navigation.navigate('Profile')}>
          <UserIcon size={20} color={COLORS.textLight} />
          <Text style={styles.drawerItemText}>My Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.drawerItem} onPress={() => supabase.auth.signOut()}>
          <Text style={[styles.drawerItemText, { color: COLORS.error, marginLeft: 28 }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let Icon;
          if (route.name === 'Home') Icon = Home;
          else if (route.name === 'Team') Icon = Users;
          else if (route.name === 'Alerts') Icon = Bell;
          else if (route.name === 'Profile') Icon = UserIcon;
          return <Icon size={24} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          height: 65,
          paddingBottom: 12,
          paddingTop: 8,
          backgroundColor: '#ffffff',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: 'bold',
        },
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Team" component={TeamScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: 280 },
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Drawer" component={DrawerNavigator} />
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  drawerHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  drawerSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  drawerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 1.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
  },
  drawerItemText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4b5563',
    marginLeft: 12,
  },
  drawerIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
  }
});
