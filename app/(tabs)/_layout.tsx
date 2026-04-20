import { Tabs } from 'expo-router';
import { Shirt, Palette, Calendar, LayoutDashboard, User } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          elevation: 10,
          backgroundColor: '#050505',
          borderRadius: 36,
          height: 72,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.15)',
          borderTopColor: 'transparent',
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 8 },
        },
        tabBarActiveTintColor: '#f5f5f5',
        tabBarInactiveTintColor: '#6b6b6b',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Studio',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="closet"
        options={{
          title: 'Closet',
          tabBarIcon: ({ color }) => <Shirt size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="canvas"
        options={{
          title: 'Design',
          tabBarIcon: ({ color }) => <Palette size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="planner"
        options={{
          title: 'Plan',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
