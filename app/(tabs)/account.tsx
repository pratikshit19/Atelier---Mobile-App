import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, LogOut, Sparkles } from 'lucide-react-native';

export default function AccountScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <ScrollView className="px-6 py-8">
        <View className="mb-8">
          <Text className="text-muted-foreground text-xs uppercase tracking-widest mb-1">Account</Text>
          <Text className="text-white text-3xl font-bold tracking-tight">Profile & Billing</Text>
        </View>

        <View className="bg-card border border-white/5 rounded-3xl p-6 mb-6">
          <View className="flex-row items-center gap-3 mb-6">
            <View className="w-12 h-12 rounded-3xl bg-primary/20 items-center justify-center">
              <ShieldCheck size={24} color="#6366f1" />
            </View>
            <View>
              <Text className="text-muted-foreground uppercase text-[10px] tracking-widest">Current Plan</Text>
              <Text className="text-white text-xl font-bold mt-1">Free</Text>
            </View>
          </View>
          <Text className="text-muted-foreground text-sm leading-6">
            You are currently on the free plan. Upgrade to unlock premium outfit planning, style alerts, and unlimited design boards.
          </Text>
        </View>

        <View className="bg-card border border-white/5 rounded-3xl p-6 mb-6">
          <Text className="text-muted-foreground uppercase text-[10px] tracking-widest mb-3">Email</Text>
          <Text className="text-white text-base font-medium">{user?.email ?? 'No email available'}</Text>
        </View>

        <TouchableOpacity
          onPress={signOut}
          className="bg-white/5 border border-white/10 rounded-3xl py-4 px-5 flex-row items-center justify-between"
        >
          <View>
            <Text className="text-white font-bold">Sign out</Text>
            <Text className="text-muted-foreground text-sm">End your session and return to login.</Text>
          </View>
          <LogOut size={20} color="#fff" />
        </TouchableOpacity>

        <View className="mt-10 bg-card border border-white/5 rounded-3xl p-5">
          <View className="flex-row items-center gap-3 mb-4">
            <View className="w-10 h-10 rounded-2xl bg-primary/20 items-center justify-center">
              <Sparkles size={20} color="#6366f1" />
            </View>
            <Text className="text-white font-bold text-lg">SaaS Essentials</Text>
          </View>
          <Text className="text-muted-foreground text-sm leading-6">
            This account page provides the core SaaS experience: secure access, profile visibility, plan status, and account control.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
