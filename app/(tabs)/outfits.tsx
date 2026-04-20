import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronRight, Shirt } from 'lucide-react-native';
import { StackedPreview } from '../../components/StackedPreview';
import { Badge } from '../../components/ui';

const getOutfitImageSources = (outfit: any) => {
  const itemImages = Array.isArray(outfit.items)
    ? outfit.items
        .map((item: any) => item.image_url || item.image || item.preview_image)
        .filter(Boolean)
    : [];

  if (itemImages.length > 0) return itemImages.slice(0, 3);

  const fallbackImages = [
    outfit.preview_image,
    outfit.image_url,
    outfit.cover_image,
    outfit.image,
  ].filter(Boolean);

  return fallbackImages.slice(0, 3);
};

const OutfitPreview = ({ outfit }: { outfit: any }) => {
  const images = getOutfitImageSources(outfit);

  return (
    <View className="h-[220px] w-full justify-center items-center pt-4">
      <StackedPreview images={images} />
    </View>
  );
};

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
    <SafeAreaView className="flex-1 bg-[#05060c]">
      <View className="px-6 pt-8 pb-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => router.back()} className="rounded-full bg-white/5 p-3">
          <ArrowLeft size={20} color="#fff" />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-white text-2xl font-semibold">Saved Outfits</Text>
          <Text className="text-muted-foreground text-sm mt-1">Your favorite looks in one place</Text>
        </View>
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
          contentContainerStyle={{ padding: 24, paddingBottom: 120 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push('/planner')}
              className="mb-6 overflow-hidden rounded-[38px] border border-white/10 bg-[#0b1220] shadow-sm"
            >
              <View className="p-4">
                <View className="rounded-[34px] bg-[#08101f] p-3">
                  <OutfitPreview outfit={item} />
                </View>
                <View className="mt-5 flex-row items-end justify-between gap-4">
                  <View className="flex-1">
                    <Text className="text-white text-2xl font-semibold">{item.name || 'Untitled Outfit'}</Text>
                    <Text className="text-muted-foreground mt-2 text-sm">{item.items?.length ? `${item.items.length} items included` : '3 items included'}</Text>
                  </View>
                  <ChevronRight size={24} color="#a1a1aa" />
                </View>
                <View className="mt-4 flex-row items-center justify-between">
                  <Text className="text-muted-foreground text-[10px] uppercase tracking-[0.3em]">STYLE</Text>
                  <Text className="text-white text-sm font-semibold">Everyday</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Shirt size={48} color="#71717a" />
              <Text className="text-muted-foreground text-sm mt-4 text-center max-w-xs">
                No saved outfits yet. Create one in the Planner to see it here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
