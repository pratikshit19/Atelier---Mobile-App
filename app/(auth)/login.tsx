import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.replace('/(tabs)');
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <ScrollView className="px-6 py-12">
        <View className="mb-12">
          <Text className="text-primary font-bold uppercase tracking-widest text-xs mb-4">Atelier Studio</Text>
          <Text className="text-white text-4xl font-bold tracking-tight">Sign In</Text>
        </View>

        <View className="space-y-4">
          <View className="relative">
            <View className="absolute left-4 top-4 z-10">
              <Mail size={20} color="#71717a" />
            </View>
            <TextInput
              className="bg-card border border-white/5 rounded-xl px-12 py-4 text-white text-sm"
              placeholder="Email address"
              placeholderTextColor="#71717a"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <View className="relative">
            <View className="absolute left-4 top-4 z-10">
              <Lock size={20} color="#71717a" />
            </View>
            <TextInput
              className="bg-card border border-white/5 rounded-xl px-12 py-4 text-white text-sm"
              placeholder="Password"
              placeholderTextColor="#71717a"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity 
            onPress={handleLogin}
            disabled={loading}
            className="bg-primary rounded-xl py-4 items-center flex-row justify-center gap-2"
          >
            <Text className="text-white font-bold uppercase tracking-widest text-sm">
              {loading ? 'Entering...' : 'Sign In'}
            </Text>
            <ArrowRight size={18} color="white" />
          </TouchableOpacity>
        </View>

        <View className="mt-8 flex-row justify-center">
          <Text className="text-muted-foreground text-sm">Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text className="text-primary font-bold text-sm">Create one</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
