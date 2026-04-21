import { Tabs } from 'expo-router';
import { Shirt, LayoutGrid, User, Settings, FolderArchive, Layers } from 'lucide-react-native';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          letterSpacing: 1,
          marginTop: -4,
          paddingBottom: 8,
        },
        tabBarStyle: {
          backgroundColor: '#090909',
          height: Platform.OS === 'ios' ? 88 : 72,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255, 255, 255, 0.05)',
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#e08a6d',
        tabBarInactiveTintColor: '#52525b',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'STUDIO',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeLine} />}
              <LayoutGrid size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="closet"
        options={{
          title: 'ARCHIVE',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeLine} />}
              <FolderArchive size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="outfits"
        options={{
          title: 'OUTFITS',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeLine} />}
              <Layers size={20} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconContainer}>
              {focused && <View style={styles.activeLine} />}
              <Settings size={20} color={color} />
            </View>
          ),
        }}
      />
      {/* Hidden tabs */}
      <Tabs.Screen
        name="canvas"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  activeLine: {
    position: 'absolute',
    top: -12,
    width: 32,
    height: 2,
    backgroundColor: '#e08a6d',
  },
});
