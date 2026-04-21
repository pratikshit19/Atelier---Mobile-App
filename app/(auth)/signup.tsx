import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowLeft } from 'lucide-react-native';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    alert('Check your inbox for a confirmation email.');
    router.replace('/login');
    setLoading(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <ScrollView className="px-6 py-12">
        <View className="mb-12">
          <Text className="text-primary font-bold uppercase tracking-widest text-xs mb-4">Atelier Studio</Text>
          <Text className="text-white text-4xl font-bold tracking-tight">Create Account</Text>
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
              keyboardType="email-address"
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
            onPress={handleSignup}
            disabled={loading}
            className="bg-primary rounded-xl py-4 items-center flex-row justify-center gap-2"
          >
            <Text className="text-white font-bold uppercase tracking-widest text-sm">
              {loading ? 'Creating...' : 'Create Account'}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-8 flex-row items-center justify-center gap-2">
          <TouchableOpacity onPress={() => router.push('/login')} className="flex-row items-center gap-2">
            <ArrowLeft size={18} color="#7c3aed" />
            <Text className="text-primary font-bold text-sm">Back to sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
