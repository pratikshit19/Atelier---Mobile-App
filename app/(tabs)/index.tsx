import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { Shirt, Palette, Calendar } from 'lucide-react-native';

export default function DashboardScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <ScrollView className="px-6 py-8">
        <View className="mb-10">
          <Text className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Welcome back</Text>
          <Text className="text-white text-3xl font-bold tracking-tight">
            {user?.email?.split('@')[0] || 'Studio'}
          </Text>
        </View>

        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-card p-6 rounded-xl border border-white/5">
            <View className="w-10 h-10 bg-primary/20 rounded-lg items-center justify-center mb-4">
              <Shirt size={20} color="#6366f1" />
            </View>
            <Text className="text-white text-2xl font-bold">12</Text>
            <Text className="text-muted-foreground text-[10px] uppercase tracking-wider">Items</Text>
          </View>
          <View className="flex-1 bg-card p-6 rounded-xl border border-white/5">
            <View className="w-10 h-10 bg-primary/20 rounded-lg items-center justify-center mb-4">
              <Palette size={20} color="#6366f1" />
            </View>
            <Text className="text-white text-2xl font-bold">5</Text>
            <Text className="text-muted-foreground text-[10px] uppercase tracking-wider">Outfits</Text>
          </View>
        </View>

        <View className="bg-card p-6 rounded-xl border border-white/5 mb-8">
          <View className="flex-row items-center gap-3 mb-4">
            <Calendar size={18} color="#6366f1" />
            <Text className="text-white font-bold uppercase tracking-widest text-xs">Today's Look</Text>
          </View>
          <Text className="text-muted-foreground text-sm italic">Plan your first outfit of the week in the Planner.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
