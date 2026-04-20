import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Crown, Mail } from 'lucide-react-native';

export default function AccountScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <ScrollView className="px-6 pt-8 pb-10">
        <View className="mb-8">
          <Text className="text-white text-4xl font-bold">Settings</Text>
          <Text className="text-muted-foreground text-sm mt-2">Manage your account preferences</Text>
        </View>

        <View className="bg-white/5 border border-white/10 rounded-[20px] p-4 mb-6">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
              <Crown size={18} color="#a1a1aa" />
            </View>
            <View className="flex-1">
              <Text className="text-muted-foreground text-xs uppercase tracking-[0.15em] mb-1">Plan</Text>
              <Text className="text-white font-bold text-sm">Free Period</Text>
            </View>
          </View>
        </View>

        <View className="bg-white/5 border border-white/10 rounded-[20px] p-4 mb-6">
          <View className="flex-row items-center gap-3">
            <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
              <Mail size={18} color="#a1a1aa" />
            </View>
            <View className="flex-1">
              <Text className="text-muted-foreground text-xs uppercase tracking-[0.15em] mb-1">Email</Text>
              <Text className="text-white font-semibold text-sm">{user?.email || 'No email'}</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={signOut}
          activeOpacity={0.8}
          className="bg-white/5 border border-white/10 rounded-[20px] p-4"
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white font-bold text-sm">Sign out</Text>
              <Text className="text-muted-foreground text-xs mt-1">End your session</Text>
            </View>
            <LogOut size={18} color="#a1a1aa" />
          </View>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
