import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { ArrowLeft, Shirt } from 'lucide-react-native';

export default function OutfitsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [outfits, setOutfits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOutfits = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOutfits(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOutfits();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOutfits();
  };

  return (
    <SafeAreaView className="flex-1 bg-[#09090b]">
      <View className="px-6 pt-8 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="rounded-full bg-white/5 p-3">
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-2xl font-bold">Outfits</Text>
        <View className="w-10" />
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
          renderItem={({ item }) => {
            const imageSource = item.preview_image || item.image_url || item.cover_image || item.image;
            return (
              <View className="mb-4 bg-card border border-white/5 rounded-3xl overflow-hidden">
                {imageSource ? (
                  <Image source={{ uri: imageSource }} className="w-full h-56" resizeMode="cover" />
                ) : (
                  <View className="w-full h-56 items-center justify-center bg-white/5">
                    <Shirt size={40} color="#71717a" />
                  </View>
                )}
                <View className="p-4">
                  <Text className="text-white text-lg font-bold mb-1">{item.name || 'Untitled Outfit'}</Text>
                  <Text className="text-muted-foreground text-sm uppercase tracking-widest">{item.category || 'Outfit'}</Text>
                  <Text className="text-muted-foreground text-sm mt-2">{item.description || 'No outfit description available.'}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Shirt size={48} color="#71717a" />
              <Text className="text-muted-foreground text-sm mt-4 text-center">
                No outfits created yet. Add your first one in the Planner or Closet.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
